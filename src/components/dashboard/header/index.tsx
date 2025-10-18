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
      <div className="sticky z-10 top-0 h-16 border-b bg-black lg:py-2.5">
        <div className="px-4 sm:px-6 flex items-center justify-between space-x-2 sm:space-x-4 2xl:container">
          <h5 className="text-xl sm:text-2xl md:text-3xl p-2 font-medium text-gray-200 title-server select-none ml-16 md:ml-0">
            Wow Libre CMS
          </h5>
          {/* Botón hamburger removido - ahora está en el sidebar */}
          <div className="flex space-x-2 sm:space-x-4">
            <div className="md:hidden lg:block">
              <div className="relative flex items-center text-gray-400 focus-within:text-cyan-400">
                <span className="absolute left-4 h-6 flex items-center pr-3 border-r border-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 fill-current text-gray-400"
                    viewBox="0 0 35.997 36.004"
                  >
                    <path
                      id="Icon_awesome-search"
                      data-name="search"
                      d="M35.508,31.127l-7.01-7.01a1.686,1.686,0,0,0-1.2-.492H26.156a14.618,14.618,0,1,0-2.531,2.531V27.3a1.686,1.686,0,0,0,.492,1.2l7.01,7.01a1.681,1.681,0,0,0,2.384,0l1.99-1.99a1.7,1.7,0,0,0,.007-2.391Zm-20.883-7.5a9,9,0,1,1,9-9A8.995,8.995,0,0,1,14.625,23.625Z"
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  name="leadingIcon"
                  id="leadingIcon"
                  placeholder="Search here"
                  className="w-full pl-14 pr-4 py-2.5 rounded-xl text-sm text-gray-300 bg-gray-800 outline-none border border-gray-600 focus:border-cyan-400 transition"
                />
              </div>
            </div>
            <button
              aria-label="search"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border bg-gray-800 focus:bg-gray-700 active:bg-gray-600  md:hidden lg:block"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 mx-auto fill-current text-gray-300"
                viewBox="0 0 35.997 36.004"
              >
                <path
                  id="Icon_awesome-search"
                  data-name="search"
                  d="M35.508,31.127l-7.01-7.01a1.686,1.686,0,0,0-1.2-.492H26.156a14.618,14.618,0,1,0-2.531,2.531V27.3a1.686,1.686,0,0,0,.492,1.2l7.01,7.01a1.681,1.681,0,0,0,2.384,0l1.99-1.99a1.7,1.7,0,0,0,.007-2.391Zm-20.883-7.5a9,9,0,1,1,9-9A8.995,8.995,0,0,1,14.625,23.625Z"
                />
              </svg>
            </button>
            <button
              aria-label="chat"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border bg-gray-800 focus:bg-gray-700 active:bg-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 m-auto text-gray-300"
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
            <button
              aria-label="notification"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border bg-gray-800 focus:bg-gray-700 active:bg-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 m-auto text-gray-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
