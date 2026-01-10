"use client";
import Cookies from "js-cookie";
import { useEffect, useMemo, useRef, useState } from "react";
import { webProps } from "@/constants/configs";

export type ChatMessage = {
  id: string;
  from: string;
  channel: string;
  content: string;
  timestamp: number;
};

const MAX_MESSAGES = 200;

const ChatPanel = ({
  gatewayUrl,
  token,
}: {
  gatewayUrl?: string;
  token?: string;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const [channel, setChannel] = useState("world");
  const authToken = token || Cookies.get("token") || "";

  const canConnect = useMemo(() => !!gatewayUrl, [gatewayUrl]);

  useEffect(() => {
    if (!canConnect) return;

    setConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(gatewayUrl as string);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setConnecting(false);
        if (authToken) {
          ws.send(
            JSON.stringify({ type: "auth", token: authToken, source: "cms" })
          );
        }
      };

      ws.onerror = () => {
        setError("No se pudo conectar al gateway de chat.");
      };

      ws.onclose = () => {
        setConnected(false);
        setConnecting(false);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const newMessage: ChatMessage = {
            id: payload.id || crypto.randomUUID(),
            from: payload.from || "desconocido",
            channel: payload.channel || "world",
            content: payload.message || payload.content || "",
            timestamp: Number(payload.timestamp) || Date.now(),
          };
          setMessages((prev) => {
            const next = [...prev, newMessage];
            return next.slice(-MAX_MESSAGES);
          });
        } catch (e) {
          // ignore malformed
        }
      };
    } catch (err: any) {
      setError(err?.message || "Error al iniciar el chat");
      setConnecting(false);
    }

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [gatewayUrl, authToken, canConnect]);

  const handleSend = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!input.trim()) return;

    const payload = {
      type: "message",
      channel,
      message: input.trim(),
      token: authToken,
    };

    wsRef.current.send(JSON.stringify(payload));
    setInput("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <p className="text-white font-semibold">Chat del juego</p>
          <p className="text-sm text-gray-400">
            Servidor: {webProps.serverName} — Canal: {channel.toUpperCase()}
          </p>
          {!gatewayUrl && (
            <p className="text-xs text-amber-400 mt-1">
              Configura el gateway en el panel de admin para habilitar el chat.
            </p>
          )}
        </div>
        <div className="text-sm text-gray-300">
          {connecting
            ? "Conectando..."
            : connected
            ? "Conectado"
            : "Desconectado"}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-[480px] flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm text-gray-300">Canal</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="world">World</option>
            <option value="guild">Guild</option>
            <option value="party">Party</option>
            <option value="say">Say</option>
            <option value="whisper">Whisper</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {messages.length === 0 && (
            <p className="text-gray-500 text-sm">Sin mensajes aún.</p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-slate-800/80 rounded-lg px-3 py-2 text-sm border border-slate-700"
            >
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  [{msg.channel}] {msg.from}
                </span>
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-gray-100 whitespace-pre-wrap break-words">
                {msg.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder={connected ? "Escribe un mensaje" : "Conecta primero"}
            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
            disabled={!connected}
          />
          <button
            onClick={handleSend}
            disabled={!connected || !input.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
          >
            Enviar
          </button>
        </div>

        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default ChatPanel;
