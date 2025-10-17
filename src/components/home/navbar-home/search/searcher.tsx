import React, { ChangeEvent, FormEvent, useState } from "react";
import { FaSearch } from "react-icons/fa";

interface Props {
  onSearch: (query: string) => void;
  placeHolder: string;
}

const Searcher: React.FC<Props> = ({ onSearch, placeHolder }) => {
  const [query, setQuery] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative">
      <form className="flex relative" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <FaSearch className="text-lg text-gaming-primary-main" />
          </div>
          <input
            className="w-full p-4 pl-12 bg-gradient-to-r from-gaming-base-main to-gaming-base-dark border-2 border-gaming-primary-main rounded-l-lg text-white text-xl font-gaming focus:outline-none focus:border-gaming-secondary-main focus:shadow-lg focus:shadow-gaming-primary-main/50 transition-all duration-300"
            type="text"
            placeholder={placeHolder}
            value={query}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="relative bg-gradient-to-r from-gaming-secondary-main to-gaming-secondary-dark border-2 border-gaming-secondary-light text-white px-8 py-4 rounded-r-lg hover:from-gaming-secondary-light hover:to-gaming-secondary-main transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-gaming-secondary-main/50 font-gaming font-bold text-lg"
        >
          <span className="relative z-10">BUSCAR</span>
          <div className="absolute inset-0 bg-gradient-to-r from-gaming-secondary-light to-gaming-secondary-main rounded-r-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </form>

      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-gaming-primary-main/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

export default Searcher;
