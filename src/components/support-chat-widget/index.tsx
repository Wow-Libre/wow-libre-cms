"use client";

import React, { useEffect, useMemo, useState } from "react";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const CHAT_CONVERSATION_KEY = "support_chat_conversation_id";
const SUPPORT_CHAT_ENABLED = false;

const createConversationId = (): string => {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    "randomUUID" in globalThis.crypto
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `conv-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const SupportChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [lastProvider, setLastProvider] = useState("sin-datos");
  const [message, setMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Saludos aventurero. Soy tu GM de soporte. Cuentame tu problema y te ayudo paso a paso.",
    },
  ]);

  const chatStatus = useMemo(() => {
    if (chatLoading) return "Escribiendo...";
    if (chatError) return "Con problemas";
    return "Online";
  }, [chatError, chatLoading]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedConversationId = window.localStorage.getItem(CHAT_CONVERSATION_KEY);
    if (savedConversationId) {
      setConversationId(savedConversationId);
      return;
    }

    const generatedConversationId = createConversationId();
    window.localStorage.setItem(CHAT_CONVERSATION_KEY, generatedConversationId);
    setConversationId(generatedConversationId);
  }, []);

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || chatLoading) return;

    const updatedMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: trimmedMessage },
    ];

    setChatMessages(updatedMessages);
    setMessage("");
    setChatError(null);
    setChatLoading(true);

    try {
      const response = await fetch("/api/help-gm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmedMessage,
          history: updatedMessages.slice(-8),
          conversationId,
          channel: "web",
          locale: typeof navigator !== "undefined" ? navigator.language : "es-ES",
        }),
      });

      const data: {
        reply?: string;
        message?: string;
        conversationId?: string;
        provider?: string;
      } = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "No fue posible contactar al GM en este momento."
        );
      }

      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(CHAT_CONVERSATION_KEY, data.conversationId);
        }
      }

      if (data.provider) {
        setLastProvider(data.provider);
      }

      const reply =
        data.reply?.trim() ||
        "No pude generar una respuesta ahora mismo. Intentalo nuevamente.";

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      const normalizedError =
        error instanceof Error
          ? error.message
          : "No fue posible contactar al GM en este momento.";
      setChatError(normalizedError);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSendMessage();
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] sm:bottom-6 sm:right-6">
      {isOpen && (
        SUPPORT_CHAT_ENABLED ? (
          <div className="mb-4 w-[min(96vw,620px)] rounded-2xl border border-cyan-500/30 bg-slate-900/95 shadow-[0_18px_50px_rgba(8,145,178,0.3)] backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-cyan-500/20 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/90">
                  GM Assistant
                </p>
                <p className="text-lg font-semibold text-white sm:text-xl">
                  Atencion al Jugador
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-300">
                {chatStatus}
              </span>
            </div>
            <div className="border-b border-slate-700/40 px-6 py-2.5 text-xs text-slate-300 sm:text-sm">
              Proveedor: <span className="font-semibold text-cyan-300">{lastProvider}</span>
            </div>

            <div className="flex h-[65vh] min-h-[560px] max-h-[760px] flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {chatMessages.map((chatItem, index) => (
                  <div
                    key={`${chatItem.role}-${index}`}
                    className={`flex ${chatItem.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-5 py-4 leading-relaxed ${
                        chatItem.role === "user"
                          ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-base text-slate-950"
                          : "border border-slate-600/40 bg-slate-800/90 text-lg text-slate-100"
                      }`}
                    >
                      {chatItem.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-slate-600/40 bg-slate-800/85 px-5 py-4 text-lg text-slate-200">
                      El GM esta escribiendo...
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-700/50 p-5">
                {chatError && (
                  <p className="mb-4 rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-3 text-base text-red-300">
                    {chatError}
                  </p>
                )}
                <form className="flex gap-3" onSubmit={handleChatFormSubmit}>
                  <input
                    type="text"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Escribe tu consulta..."
                    className="flex-1 rounded-xl border border-slate-600/50 bg-slate-950/70 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400/70"
                    maxLength={500}
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || message.trim().length === 0}
                    className="rounded-xl bg-cyan-500 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 w-[min(92vw,420px)] rounded-2xl border border-cyan-500/30 bg-slate-900/95 p-5 shadow-[0_18px_50px_rgba(8,145,178,0.25)] backdrop-blur-md sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/90">
              GM Assistant
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">
              Disponible Proximamente
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
              El chat de soporte estara disponible proximamente. Gracias por tu paciencia.
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-5 w-full rounded-xl border border-slate-600/80 bg-slate-800/60 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700/70"
            >
              Entendido
            </button>
          </div>
        )
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex h-16 w-16 items-center justify-center rounded-full border text-white transition hover:scale-105 ${
          SUPPORT_CHAT_ENABLED
            ? "border-cyan-400/45 bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_8px_26px_rgba(6,182,212,0.6)]"
            : "border-slate-400/45 bg-gradient-to-br from-slate-500 to-slate-700 shadow-[0_8px_22px_rgba(100,116,139,0.45)]"
        }`}
        aria-label={
          isOpen
            ? "Cerrar widget de soporte"
            : SUPPORT_CHAT_ENABLED
              ? "Abrir chat de soporte"
              : "Abrir mensaje de proximamente"
        }
      >
        {isOpen ? (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 10h8M8 14h5m-9 7l1.6-3.2A8 8 0 114 17.6V21z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default SupportChatWidget;
