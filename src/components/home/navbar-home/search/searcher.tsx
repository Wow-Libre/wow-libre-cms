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
            <FaSearch className="text-purple-400 text-lg" />
          </div>
          <input
            className="w-full p-4 pl-12 bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-purple-500 rounded-l-lg text-white text-xl font-serif focus:outline-none focus:border-yellow-400 focus:shadow-lg focus:shadow-purple-500/50 placeholder:text-gray-300 placeholder:text-xl transition-all duration-300"
            type="text"
            placeholder={placeHolder}
            value={query}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="relative bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-4 rounded-r-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/50 border-2 border-yellow-400 font-bold text-lg"
        >
          <span className="relative z-10">BUSCAR</span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-r-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </form>

      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-purple-400/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

export default Searcher;
