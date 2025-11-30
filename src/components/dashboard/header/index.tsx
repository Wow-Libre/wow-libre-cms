import { SERVER_NAME } from "@/configs/configs";
import React, { useState } from "react";

const Header: React.FC = () => {
  // Estado para controlar si el modal está visible o no
  const [isModalVisible, setModalVisible] = useState(false);

  // Función para alternar la visibilidad del modal
  const toggleModal = () => {
    setModalVisible((prev) => !prev);
  };

  return (
    <div className="ml-auto lg:w-[75%] xl:w-[80%] 2xl:w-[85%]">
      <div className="sticky z-10 top-0 h-16 border-b border-slate-700/50 bg-gradient-to-r from-slate-950/98 via-slate-900/98 to-slate-950/98 backdrop-blur-xl shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full 2xl:container">
          <div className="flex items-center">
            <h5 className="text-xl sm:text-2xl md:text-3xl font-bold text-white select-none ml-16 md:ml-0 tracking-tight">
              {SERVER_NAME} CMS
            </h5>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Input de búsqueda - Desktop */}
            <div className="hidden lg:block w-64 xl:w-80">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  name="leadingIcon"
                  id="leadingIcon"
                  placeholder="Buscar..."
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg text-sm text-white bg-slate-800/60 backdrop-blur-sm outline-none border border-slate-700/50 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 placeholder:text-slate-500 hover:border-slate-600/50"
                />
              </div>
            </div>

            {/* Botón búsqueda - Mobile */}
            <button
              aria-label="search"
              className="w-10 h-10 rounded-lg border border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/60 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 flex items-center justify-center lg:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                />
              </svg>
            </button>

            {/* Botón Chat */}
            <button
              aria-label="chat"
              className="relative w-10 h-10 rounded-lg border border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/60 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 flex items-center justify-center group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </button>

            {/* Botón Notificaciones */}
            <button
              aria-label="notification"
              className="relative w-10 h-10 rounded-lg border border-slate-700/50 bg-slate-800/60 hover:bg-slate-700/60 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200 flex items-center justify-center group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              {/* Indicador de notificaciones */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border border-slate-900"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
