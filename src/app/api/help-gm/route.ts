import { BASE_URL_CORE } from "@/configs/configs";
import { NextRequest, NextResponse } from "next/server";

const HELP_GM_TIMEOUT_MS = Number(process.env.HELP_GM_TIMEOUT_MS) || 90_000;

/** Misma base que el proxy `/api/wow-core` (wow-core en red interna). */
function getWowCoreApiBase(): string {
  return (
    process.env.WOW_CORE_INTERNAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL_CORE?.trim() ||
    BASE_URL_CORE
  ).replace(/\/$/, "");
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

function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "TimeoutError" ||
      error.name === "AbortError" ||
      error.message.toLowerCase().includes("timeout") ||
      error.message.toLowerCase().includes("aborted"))
  );
}

function buildClientErrorMessage(
  lastWowCoreError: string,
  options: { timedOut: boolean; hasBearerToken: boolean },
): string {
  if (options.timedOut) {
    return options.hasBearerToken
      ? "El GM tardó demasiado en responder. Intenta de nuevo en unos segundos."
      : "El GM tardó demasiado en responder. Intenta de nuevo.";
  }

  const lower = lastWowCoreError.toLowerCase();
  if (
    lower.includes("fetch failed") ||
    lower.includes("econnrefused") ||
    lower.includes("enotfound")
  ) {
    return "No fue posible contactar al GM. ";
  }

  if (options.hasBearerToken && lastWowCoreError.includes("401")) {
    return "Tu sesión expiró. Cierra sesión, vuelve a entrar e intenta otra vez.";
  }

  return "No fue posible contactar al GM en este momento.";
}

const WOW_CORE_ASSIST_PATH = "/api/ai/assist";
const WOW_CORE_ASSIST_AUTH_PATH = "/api/ai/assist/auth";

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
        { status: 400 },
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

    const wowCoreApiBase = getWowCoreApiBase();
    const wowCoreCandidates = bearerToken
      ? [WOW_CORE_ASSIST_AUTH_PATH, WOW_CORE_ASSIST_PATH]
      : [WOW_CORE_ASSIST_PATH];

    let lastWowCoreError = "Wow Core no respondio al asistente GM.";
    let authTimedOut = false;

    console.log("[help-gm] Request", {
      apiBase: wowCoreApiBase,
      paths: wowCoreCandidates,
      hasBearerToken: Boolean(bearerToken),
      timeoutMs: HELP_GM_TIMEOUT_MS,
    });

    for (const wowCorePath of wowCoreCandidates) {
      if (authTimedOut && wowCorePath === WOW_CORE_ASSIST_PATH) {
        break;
      }

      const targetUrl = `${wowCoreApiBase}${wowCorePath}`;
      const attemptStartedAt = Date.now();

      try {
        const wowCoreResponse = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(bearerToken ? { Authorization: bearerToken } : {}),
          },
          cache: "no-store",
          signal: AbortSignal.timeout(HELP_GM_TIMEOUT_MS),
          body: JSON.stringify(wowCoreRequestBody),
        });

        const elapsedMs = Date.now() - attemptStartedAt;

        if (wowCoreResponse.ok) {
          const wowCoreData =
            (await wowCoreResponse.json()) as WowCoreAssistResponseDto;
          const wowCoreReply = (
            wowCoreData.data?.reply ||
            wowCoreData.reply ||
            ""
          ).trim();

          if (wowCoreReply) {
            console.log("[help-gm] Success", {
              targetUrl,
              status: wowCoreResponse.status,
              provider: resolveWowCoreProvider(wowCoreData),
              replyLength: wowCoreReply.length,
              elapsedMs,
            });

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

          lastWowCoreError = "Wow Core respondio sin contenido en reply.";
          console.warn("[help-gm] Empty reply", { targetUrl, elapsedMs });
        } else {
          const errorBody = await wowCoreResponse.text();
          lastWowCoreError = `Wow Core ${wowCoreResponse.status}: ${errorBody}`;
          console.warn("[help-gm] HTTP error", {
            targetUrl,
            status: wowCoreResponse.status,
            errorBody: errorBody.slice(0, 500),
            elapsedMs,
          });
        }
      } catch (error) {
        const elapsedMs = Date.now() - attemptStartedAt;
        lastWowCoreError =
          error instanceof Error
            ? error.message
            : "Error de conexion con Wow Core";

        if (
          isTimeoutError(error) &&
          wowCorePath === WOW_CORE_ASSIST_AUTH_PATH &&
          bearerToken
        ) {
          authTimedOut = true;
        }

        console.warn("[help-gm] Connection failed", {
          targetUrl,
          error: lastWowCoreError,
          elapsedMs,
          authTimedOut,
        });
      }
    }

    const timedOut = authTimedOut || isTimeoutError(lastWowCoreError);

    return NextResponse.json(
      {
        message: buildClientErrorMessage(lastWowCoreError, {
          timedOut,
          hasBearerToken: Boolean(bearerToken),
        }),
        detail: lastWowCoreError,
      },
      { status: timedOut ? 504 : 502 },
    );
  } catch (error) {
    console.error("[help-gm] Unexpected error:", error);
    return NextResponse.json(
      { message: "Error interno al consultar el GM." },
      { status: 500 },
    );
  }
}
