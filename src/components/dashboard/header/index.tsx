import { SERVER_NAME } from "@/configs/configs";
import React, { useState } from "react";

const Header: React.FC = () => {
  // Estado para controlar si el modal está visible o no
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <div className="ml-auto lg:w-[75%] xl:w-[80%] 2xl:w-[85%]">
      <div className="sticky z-10 top-0 h-16 border-b border-slate-700/50 bg-gradient-to-r from-slate-950/98 via-slate-900/98 to-slate-950/98 backdrop-blur-xl shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full 2xl:container">
          <div className="flex items-center">
            <h5 className="text-xl sm:text-2xl md:text-3xl font-bold text-white select-none ml-16 md:ml-0 tracking-tight">
              {SERVER_NAME} CMS
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
