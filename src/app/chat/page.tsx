"use client";
import ChatPanel from "@/components/chat";
import { BASE_URL_CHAT_GATEWAY, CHAT_GATEWAY_TOKEN } from "@/configs/configs";
import NavbarAuthenticated from "@/components/navbar-authenticated";

const ChatPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mb-10">
        <NavbarAuthenticated />
      </div>
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <h1 className="text-3xl font-bold mb-2">Chat del juego</h1>
        <p className="text-gray-400 mb-6">
          Visualiza y envía mensajes al chat del servidor. Requiere que el gateway de
          chat esté configurado y habilitado.
        </p>
        <ChatPanel
          gatewayUrl={BASE_URL_CHAT_GATEWAY}
          token={CHAT_GATEWAY_TOKEN}
        />
      </div>
    </div>
  );
};

export default ChatPage;
