"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { FaSearch } from "react-icons/fa";

interface Props {
  onSearch: (query: string) => void;
  placeHolder: string;
}

const SearchBar: React.FC<Props> = ({ onSearch, placeHolder }) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative group">
      <form className="relative flex bg-gaming-base-main/80 backdrop-blur-sm border border-gaming-primary-main/30 rounded-2xl overflow-hidden shadow-xl hover:shadow-gaming-primary-main/20 transition-all duration-300" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          {/* Icono de búsqueda */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 z-20 pointer-events-none">
            <FaSearch className={`text-lg transition-colors duration-300 ${isFocused ? 'text-gaming-secondary-main' : 'text-gaming-primary-main/70'}`} />
          </div>
          
          {/* Input */}
          <input
            className={`w-full p-4 pl-12 pr-4 bg-transparent text-white text-lg font-medium placeholder-gray-400 focus:outline-none transition-all duration-300 relative z-30 ${
              isFocused ? 'placeholder-gray-300' : ''
            }`}
            type="text"
            placeholder={placeHolder}
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          
          {/* Efecto de focus */}
          <div className={`absolute inset-0 bg-gradient-to-r from-gaming-primary-main/5 via-gaming-secondary-main/5 to-gaming-primary-main/5 transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
        
        {/* Separador */}
        <div className="w-px bg-gaming-primary-main/30"></div>
        
        {/* Botón */}
        <button
          type="submit"
          className={`relative bg-gradient-to-r from-gaming-primary-main to-gaming-primary-dark text-white px-6 py-4 font-semibold text-sm transition-all duration-300 hover:from-gaming-primary-light hover:to-gaming-primary-main hover:shadow-lg hover:shadow-gaming-primary-main/30 hover:scale-105 hover:-translate-y-0.5 ${
            isFocused ? 'shadow-md shadow-gaming-primary-main/20' : ''
          }`}
        >
          <span className="relative z-10 flex items-center gap-2">
            BUSCAR
            <FaSearch className="text-xs transition-transform duration-300 group-hover:rotate-12" />
          </span>
          
          {/* Efecto de brillo en hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-gaming-secondary-main/20 via-gaming-primary-light/30 to-gaming-secondary-main/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Efecto de partículas */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
          </div>
        </button>
      </form>

      {/* Efecto de hover sutil */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gaming-primary-main/10 via-gaming-secondary-main/10 to-gaming-primary-main/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

export default SearchBar;