"use client";
import Cookies from "js-cookie";
import { useEffect, useMemo, useState, type FC } from "react";
import ChatPanel from "@/components/chat";
import { BASE_URL_CHAT_GATEWAY, CHAT_GATEWAY_TOKEN } from "@/configs/configs";

const ChatDashboard: FC = () => {
  const [gatewayUrl, setGatewayUrl] = useState<string>(BASE_URL_CHAT_GATEWAY || "");
  const [apiToken, setApiToken] = useState<string>(CHAT_GATEWAY_TOKEN || "");
  const [status, setStatus] = useState<"idle" | "testing" | "ok" | "fail">(
    "idle"
  );
  const token = Cookies.get("token") || "";

  const canTest = useMemo(() => !!gatewayUrl, [gatewayUrl]);

  const handleTestConnection = async () => {
    if (!gatewayUrl) return;
    setStatus("testing");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(gatewayUrl.replace(/^ws/, "http"), {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        setStatus("ok");
      } else {
        setStatus("fail");
      }
    } catch (err) {
      setStatus("fail");
    }
  };

  useEffect(() => {
    setStatus("idle");
  }, [gatewayUrl]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h2 className="text-2xl font-bold text-white mb-2">Chat del juego</h2>
        <p className="text-gray-400 text-sm">
          Configura el gateway y prueba la conexión. El chat usa WebSocket; si no hay
          gateway configurado, solo se mostrará un aviso.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-300 block mb-1">Gateway WS</label>
            <input
              value={gatewayUrl}
              onChange={(e) => setGatewayUrl(e.target.value)}
              placeholder="wss://tu-gateway/chat"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              También puedes definir NEXT_PUBLIC_CHAT_GATEWAY_URL en el entorno.
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-1">Token del gateway</label>
            <input
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Token o API key"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si el gateway requiere auth, envía este token desde el cliente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={!canTest || status === "testing"}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-40"
          >
            {status === "testing" ? "Probando..." : "Probar conexión"}
          </button>
          <span className="text-sm text-gray-300">
            Estado: {status === "idle" && "Sin probar"}
            {status === "testing" && "Probando"}
            {status === "ok" && "OK"}
            {status === "fail" && "Error"}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <ChatPanel gatewayUrl={gatewayUrl} token={apiToken || token} />
      </div>
    </div>
  );
};

export default ChatDashboard;
