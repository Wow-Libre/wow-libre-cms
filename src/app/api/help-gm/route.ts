import { NextRequest, NextResponse } from "next/server";

/**
 * Origen del propio sitio para llamadas server-side al proxy wow-core.
 * No usar `request.nextUrl.origin` (CodeQL SSRF: Host / forwarded headers).
 */
function getTrustedWowCoreBaseUrl(): string {
  const configured =
    process.env.WOW_CORE_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL?.trim()
      ? `https://${process.env.VERCEL_URL.trim()}`
      : "");

  if (!configured) {
    throw new Error(
      "Missing WOW core base URL. Set WOW_CORE_BASE_URL or NEXT_PUBLIC_APP_URL (VERCEL_URL is used on Vercel when set).",
    );
  }

  const parsed = new URL(configured);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("WOW core base URL must use http or https protocol.");
  }

  return parsed.origin;
}

interface ChatMessageDto {
  role: "user" | "assistant";
  content: string;
}

interface GenerateRequestDto {
  prompt?: string;
  history?: ChatMessageDto[];
  conversationId?: string;
  channel?: string;
  locale?: string;
  userId?: string;
}

interface OllamaGenerateResponse {
  response?: string;
}

interface WowCoreAssistRequestDto {
  message: string;
  history: ChatMessageDto[];
  conversationId?: string;
  channel: string;
  locale?: string;
  userId?: string;
}

interface WowCoreAssistResponseDto {
  data?: {
    reply?: string;
    conversationId?: string;
    sources?: string[];
  };
  reply?: string;
  message?: string;
  conversationId?: string;
}

function resolveWowCoreProvider(payload: WowCoreAssistResponseDto): string {
  const sources = payload.data?.sources || [];
  if (sources.includes("deepseek")) return "deepseek";
  if (sources.includes("ollama")) return "ollama";
  if (sources.includes("fallback")) return "fallback";
  return "wow-core";
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://192.168.1.50:11434";
const OLLAMA_MODEL = process.env.OLLAMA_HELP_MODEL || "qwen2.5-coder:14b";
const OLLAMA_TIMEOUT_MS = 25000;
const WOW_CORE_ASSIST_PATH = "/api/wow-core/api/ai/assist";
const WOW_CORE_ASSIST_AUTH_PATH = "/api/wow-core/api/ai/assist/auth";

function buildPrompt(prompt: string, history: ChatMessageDto[]): string {
  const systemPrompt = `
Eres un GM (Game Master) experto en atencion al jugador para un servidor privado de World of Warcraft.
Responde en espanol, tono claro y amable, con pasos concretos para resolver problemas.
Si faltan datos para ayudar, pide solo la informacion minima necesaria.
No inventes acciones administrativas ya ejecutadas.
  `.trim();

  const historyText = history
    .slice(-8)
    .map((item) => `${item.role === "user" ? "Jugador" : "GM"}: ${item.content}`)
    .join("\n");

  return `${systemPrompt}\n\n${historyText}\nJugador: ${prompt}\nGM:`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as GenerateRequestDto;
    const prompt = body.prompt?.trim();
    const history = Array.isArray(body.history) ? body.history : [];
    const conversationId = body.conversationId?.trim();
    const channel = body.channel?.trim() || "web";
    const locale = body.locale?.trim();
    const userId = body.userId?.trim();
    const authorizationHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("token")?.value?.trim();
    const bearerToken =
      authorizationHeader && authorizationHeader.startsWith("Bearer ")
        ? authorizationHeader
        : cookieToken
          ? `Bearer ${cookieToken}`
          : null;

    if (!prompt) {
      return NextResponse.json(
        { message: "El prompt es requerido." },
        { status: 400 }
      );
    }

    const wowCoreRequestBody: WowCoreAssistRequestDto = {
      message: prompt,
      history: history.slice(-8),
      conversationId,
      channel,
      locale,
      userId,
    };

    let wowCoreBaseUrl: string;
    try {
      wowCoreBaseUrl = getTrustedWowCoreBaseUrl();
    } catch (configError) {
      console.error("[help-gm]", configError);
      wowCoreBaseUrl = "";
    }

    const wowCoreCandidates = wowCoreBaseUrl
      ? bearerToken
        ? [WOW_CORE_ASSIST_AUTH_PATH, WOW_CORE_ASSIST_PATH]
        : [WOW_CORE_ASSIST_PATH]
      : [];

    for (const wowCorePath of wowCoreCandidates) {
      try {
        const wowCoreResponse = await fetch(
          `${wowCoreBaseUrl}${wowCorePath}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(bearerToken ? { Authorization: bearerToken } : {}),
            },
            cache: "no-store",
            signal: AbortSignal.timeout(12000),
            body: JSON.stringify(wowCoreRequestBody),
          }
        );

        if (wowCoreResponse.ok) {
          const wowCoreData =
            (await wowCoreResponse.json()) as WowCoreAssistResponseDto;
          const wowCoreReply = (
            wowCoreData.data?.reply ||
            wowCoreData.reply ||
            ""
          ).trim();

          if (wowCoreReply) {
            return NextResponse.json({
              reply: wowCoreReply,
              conversationId:
                wowCoreData.data?.conversationId ||
                wowCoreData.conversationId ||
                conversationId ||
                "",
              provider: resolveWowCoreProvider(wowCoreData),
            });
          }
        } else {
          const errorBody = await wowCoreResponse.text();
          console.warn(
            `[help-gm] Wow Core assist unavailable on ${wowCorePath}, trying fallback:`,
            wowCoreResponse.status,
            errorBody
          );
        }
      } catch (error) {
        console.warn(
          `[help-gm] Wow Core assist connection failed on ${wowCorePath}, trying fallback:`,
          error
        );
      }
    }

    const ollamaCandidates = [
      OLLAMA_BASE_URL,
      "http://127.0.0.1:11434",
      "http://localhost:11434",
      "http://host.docker.internal:11434",
    ].filter((value, index, arr) => arr.indexOf(value) === index);

    let data: OllamaGenerateResponse | null = null;
    let lastErrorMessage = "No fue posible conectar con Ollama.";

    for (const baseUrl of ollamaCandidates) {
      try {
        const ollamaResponse = await fetch(`${baseUrl}/api/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: buildPrompt(prompt, history),
            stream: false,
          }),
        });

        if (!ollamaResponse.ok) {
          const errorBody = await ollamaResponse.text();
          lastErrorMessage = `Ollama respondio ${ollamaResponse.status} en ${baseUrl}: ${errorBody}`;
          console.error("[help-gm] Ollama error:", lastErrorMessage);
          continue;
        }

        data = (await ollamaResponse.json()) as OllamaGenerateResponse;
        break;
      } catch (error) {
        const normalized =
          error instanceof Error ? error.message : "Error desconocido";
        lastErrorMessage = `No se pudo conectar a ${baseUrl}: ${normalized}`;
        console.error("[help-gm] Connection error:", lastErrorMessage);
      }
    }

    if (!data) {
      return NextResponse.json(
        { message: lastErrorMessage },
        { status: 502 }
      );
    }

    return NextResponse.json({
      reply: data.response?.trim() || "",
      conversationId: conversationId || "",
      provider: "ollama-fallback",
    });
  } catch (error) {
    console.error("[help-gm] Unexpected error:", error);
    return NextResponse.json(
      { message: "Error interno al consultar el GM." },
      { status: 500 }
    );
  }
}
