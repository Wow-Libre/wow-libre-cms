import { useRouter } from "next/navigation";
import { useState } from "react";

const Sidebar: React.FC<{ onOptionChange: (option: string) => void }> = ({
  onOptionChange,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const router = useRouter();
  const [openDashboard, setOpenDashboard] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuClick = (menu: string) => {
    setSelectedOption(menu);
    onOptionChange(menu);
    setIsMobileMenuOpen(false);
  };

  const handleReturnPage = () => {
    router.push("/realms");
    setSelectedOption("");
  };

  return (
    <>
      {/* Botón hamburger para móvil */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800/90 border border-slate-600/50 rounded-lg text-white hover:bg-slate-700/90 transition-all duration-300 shadow-lg"
      >
        <div className="w-5 h-5 flex flex-col justify-center space-y-2">
          <span
            className={`block h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          ></span>
          <span
            className={`block h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          ></span>
        </div>
      </button>

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed z-50 top-0 pb-3 px-6 
        w-80 flex flex-col justify-between h-screen 
        border-r border-slate-700/30 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transition-all duration-300 
        md:w-4/12 lg:w-[25%] xl:w-[20%] 2xl:w-[15%] 
        overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 scrollbar-hide
        ${isMobileMenuOpen ? "left-0" : "-left-80 md:left-0"}`}
      >
        {" "}
        <div>
          <div className="mt-8 text-center">
            <div className="relative">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/WoW_icon.svg/1200px-WoW_icon.svg.png"
                alt=""
                className="w-12 h-12 m-auto rounded-full object-cover lg:w-20 lg:h-20 border-2 border-slate-600/50 shadow-lg"
              />
            </div>
            <div className="hidden mt-4 lg:flex lg:items-center lg:justify-center lg:space-x-2">
              <h5 className="text-xl font-bold text-white">Panel Admin</h5>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="hidden text-slate-400 text-sm lg:block">
              Administrador
            </span>
          </div>
          <hr className="my-6 border-slate-600/50" />
          <h6 className="px-4 text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
            Configuraciones del reino
          </h6>
          <ul className="space-y-1 tracking-wide">
            {/* Portals */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("portals");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "portals"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-300"
                    fillRule="evenodd"
                    d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                    clipRule="evenodd"
                  />
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-600"
                    d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                  />
                </svg>
                <span className="font-medium">Portales</span>
              </a>
            </li>

            {/* Reino */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("adversing");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "adversing"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-300"
                    fillRule="evenodd"
                    d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                    clipRule="evenodd"
                  />
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-600"
                    d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                  />
                </svg>
                <span className="font-medium">Mi reino</span>
              </a>
            </li>
            {/* Beneficios VIP */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("premium");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "premium"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-300"
                    fillRule="evenodd"
                    d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                    clipRule="evenodd"
                  />
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-600"
                    d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                  />
                </svg>
                <span className="font-medium">Beneficios VIP</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("promotions");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "promotions"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-300"
                    fillRule="evenodd"
                    d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                    clipRule="evenodd"
                  />
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-600"
                    d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                  />
                </svg>
                <span className="font-medium">Promociones</span>
              </a>
            </li>

            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("settings");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "settings"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-300"
                    fillRule="evenodd"
                    d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                    clipRule="evenodd"
                  />
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-600"
                    d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                  />
                </svg>
                <span className="font-medium">Configuracion</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("seo");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "seo"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 11a7 7 0 1114 0 7 7 0 01-14 0zm7-5a5 5 0 00-5 5h2a3 3 0 116 0h2a5 5 0 00-5-5z" />
                </svg>
                <span className="font-medium">SEO</span>
              </a>
            </li>
            {/* Productos */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("products");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "products"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-300"
                    fillRule="evenodd"
                    d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                    clipRule="evenodd"
                  />
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-600"
                    d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
                  />
                </svg>
                <span className="font-medium">Productos</span>
              </a>
            </li>
            {/* Separador + Sección de servidor */}
            <hr className="my-4 border-gray-600" />
            <h6 className="px-4 text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
              Servidor
            </h6>
            {/* Transacciones */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("transactions");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
            ${
              selectedOption === "transactions"
                ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
            }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  <path d="M21 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2h18zm-9 6h6v2h-6v-2z" />
                </svg>
                <span className="font-medium">Transacciones</span>
              </a>
            </li>
            {/* Chat */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("chat");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
            ${
              selectedOption === "chat"
                ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
            }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2h-6l-4 4v-4H6a2 2 0 01-2-2V5z" />
                </svg>

                <span className="font-medium">Chat</span>
              </a>
            </li>
            {/* Payment Methods  */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("paymentMethods");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
            ${
              selectedOption === "paymentMethods"
                ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
            }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  <path d="M19 3h-4v2h4v4h2V5a2 2 0 00-2-2zm-4 14v2h4a2 2 0 002-2v-4h-2v4h-4z" />
                </svg>
                <span className="font-medium">Medios de pago</span>
              </a>
            </li>
            {/* Proveedores (se queda fuera del dashboard) */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("provider");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
            ${
              selectedOption === "provider"
                ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
            }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  <path d="M19 3h-4v2h4v4h2V5a2 2 0 00-2-2zm-4 14v2h4a2 2 0 002-2v-4h-2v4h-4z" />
                </svg>
                <span className="font-medium">Proveedores</span>
              </a>
            </li>
            {/* FAQs */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("faqs");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "faqs"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-300"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 17a1.25 1.25 0 110-2.5A1.25 1.25 0 0112 19zm1-4h-2v-.5c0-1.1.9-2 2-2 .55 0 1-.45 1-1s-.45-1-1-1a1 1 0 00-1 1H9c0-1.66 1.34-3 3-3s3 1.34 3 3c0 1.3-.84 2.4-2 2.82V15z"
                  />
                </svg>

                <span className="font-medium">Faqs</span>
              </a>
            </li>
            {/* Advertising */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("advertising");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "advertising"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-300"
                    d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H7l-4 4V6a2 2 0 012-2z"
                  />
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-600"
                    d="M8 9h8v2H8V9zm0 4h5v2H8v-2z"
                  />
                </svg>

                <span className="font-medium">Advertising</span>
              </a>
            </li>

            {/* Votes */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("votes");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "votes"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-300"
                    d="M3 10h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10z"
                  />
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-600"
                    d="M14.59 2.59a2 2 0 00-2.83 0L8 6.34V8h8V6.34l-1.41-1.41z"
                  />
                </svg>

                <span className="font-medium">Votes</span>
              </a>
            </li>
            {/* Dashboard */}
            <li>
              <a
                href="#"
                aria-label="dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("dashboard");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "dashboard"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg className="-ml-1 h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                    className="fill-current text-cyan-400 dark:fill-slate-600"
                  ></path>
                  <path
                    d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                    className="fill-current text-cyan-200 group-hover:text-cyan-300"
                  ></path>
                  <path
                    d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                    className="fill-current group-hover:text-sky-300"
                  ></path>
                </svg>
                <span className="font-medium">Dashboard</span>
              </a>
            </li>
            {/* News */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("news");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "news"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-300"
                    d="M12 2a7 7 0 00-7 7v3.586l-.707.707A1 1 0 005 15h14a1 1 0 00.707-1.707L19 12.586V9a7 7 0 00-7-7z"
                  />
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-600"
                    d="M13.73 21a2 2 0 01-3.46 0h3.46z"
                  />
                </svg>

                <span className="font-medium">Noticias</span>
              </a>
            </li>

            {/* Bank */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("bank");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "bank"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-300"
                    d="M12 2L2 7v2h20V7L12 2z"
                  />
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-600"
                    d="M4 10v10h2v-8h2v8h2v-8h2v8h2v-8h2v8h2v-8h2v8h2V10H4z"
                  />
                </svg>

                <span className="font-medium">Bank</span>
              </a>
            </li>

            {/* Users */}
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick("users");
                }}
                className={`relative px-4 py-3 flex items-center space-x-3 rounded-lg transition-all duration-300 select-none group
              ${
                selectedOption === "users"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-blue-300 hover:border-blue-500/30 border border-transparent"
              }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-300"
                    d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5z"
                  />
                  <path
                    className="fill-current text-gray-200 group-hover:text-cyan-600"
                    d="M4 20v-1c0-2.2 3.6-4 8-4s8 1.8 8 4v1H4z"
                  />
                </svg>
                <span className="font-medium">Usuarios</span>
              </a>
            </li>
          </ul>
        </div>
        <div className="px-6 -mx-6 pt-4 flex justify-between items-center border-t border-slate-700/50">
          <button
            className="px-4 py-3 flex items-center space-x-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group w-full"
            onClick={handleReturnPage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
