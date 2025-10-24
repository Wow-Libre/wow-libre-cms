import React, { useState } from "react";

interface EditGuildModalProps {
  isPublic: boolean;
  isMultifactorEnabled: boolean;
  discordLink: string;
  onSave: (newSettings: {
    isPublic: boolean;
    isMultifactorEnabled: boolean;
    discordLink: string;
  }) => void;
  t: (key: string, options?: any) => string;
}

const EditGuildModal: React.FC<EditGuildModalProps> = ({
  isPublic,
  isMultifactorEnabled,
  discordLink,
  onSave,
  t,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [publicAccess, setPublicAccess] = useState(isPublic);
  const [multifactor, setMultifactor] = useState(isMultifactorEnabled);
  const [discordURL, setDiscordURL] = useState(discordLink);

  const handleSave = () => {
    onSave({
      isPublic: publicAccess,
      isMultifactorEnabled: multifactor,
      discordLink: discordURL,
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón para abrir el modal */}
      <button
        className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-500/30 text-blue-300 font-bold rounded-xl hover:from-blue-500/30 hover:to-indigo-500/30 hover:border-blue-400 hover:text-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 overflow-hidden"
        onClick={() => setIsOpen(true)}
      >
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Contenido del botón */}
        <span className="relative z-10 flex items-center justify-center space-x-3">
          <span className="text-xl">⚙️</span>
          <span className="text-lg">{t("guild-model-edit.btn.edit")}</span>
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm border border-gray-700/50 text-white p-8 rounded-2xl w-11/12 max-w-lg shadow-2xl">
            {/* Efecto de brillo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 rounded-2xl blur-xl"></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-lg">⚙️</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                  {t("guild-model-edit.title")}
                </h2>
              </div>

              {/* Selector Público o Privado */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-sm">👁️</span>
                    </div>
                    <span className="text-lg font-semibold text-white">
                      Visibilidad
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-400">
                      {t("guild-model-edit.private-txt")}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={publicAccess}
                        onChange={() => setPublicAccess(!publicAccess)}
                        className="sr-only"
                      />
                      <div
                        className={`w-14 h-7 rounded-full transition-colors ${
                          publicAccess ? "bg-blue-500" : "bg-gray-600"
                        }`}
                      ></div>
                      <span
                        className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform transform ${
                          publicAccess ? "translate-x-7" : ""
                        }`}
                      ></span>
                    </label>
                    <span className="text-sm font-medium text-gray-400">
                      {t("guild-model-edit.public-txt")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selector de Multifactor */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-sm">🔐</span>
                    </div>
                    <span className="text-lg font-semibold text-white">
                      {t("guild-model-edit.multifacction")}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={multifactor}
                      onChange={() => setMultifactor(!multifactor)}
                      className="sr-only"
                    />
                    <div
                      className={`w-14 h-7 rounded-full transition-colors ${
                        multifactor ? "bg-purple-500" : "bg-gray-600"
                      }`}
                    ></div>
                    <span
                      className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform transform ${
                        multifactor ? "translate-x-7" : ""
                      }`}
                    ></span>
                  </label>
                </div>
              </div>

              {/* Campo de texto para Discord */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm">💬</span>
                  </div>
                  <label className="text-lg font-semibold text-white">
                    {t("guild-model-edit.discord")}
                  </label>
                </div>
                <input
                  type="text"
                  value={discordURL}
                  onChange={(e) => setDiscordURL(e.target.value)}
                  placeholder="https://discord.gg/tu-enlace"
                  className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  className="group relative px-6 py-3 bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 text-gray-300 font-semibold rounded-lg hover:bg-gray-600/80 hover:border-gray-500 hover:text-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/20 focus:outline-none focus:ring-2 focus:ring-gray-500/50 overflow-hidden"
                  onClick={() => setIsOpen(false)}
                >
                  {/* Efecto de brillo sutil */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Contenido del botón */}
                  <span className="relative z-10 flex items-center space-x-2">
                    <span className="text-lg">❌</span>
                    <span>{t("guild-model-edit.btn.cancel")}</span>
                  </span>
                </button>

                <button
                  className="group relative px-6 py-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-500/30 text-blue-300 font-semibold rounded-lg hover:from-blue-500/30 hover:to-indigo-500/30 hover:border-blue-400 hover:text-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 overflow-hidden"
                  onClick={handleSave}
                >
                  {/* Efecto de brillo sutil */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Contenido del botón */}
                  <span className="relative z-10 flex items-center space-x-2">
                    <span className="text-lg">✅</span>
                    <span>{t("guild-model-edit.btn.save")}</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditGuildModal;
