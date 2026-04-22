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
      <form
        className="relative flex overflow-hidden rounded-xl border border-zinc-500/35 bg-black/55 shadow-[0_10px_26px_rgba(0,0,0,0.42)] backdrop-blur-md transition-all duration-300 hover:border-amber-300/35"
        onSubmit={handleSubmit}
      >
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 z-20 pointer-events-none">
            <FaSearch
              className={`text-sm transition-colors duration-300 ${
                isFocused ? "text-amber-200" : "text-zinc-300/70"
              }`}
            />
          </div>

          <input
            className={`relative z-30 w-full bg-transparent px-4 py-3.5 pl-11 pr-4 text-sm font-medium tracking-[0.01em] text-zinc-100 placeholder:text-zinc-400/85 focus:outline-none transition-all duration-300 ${
              isFocused ? "placeholder:text-zinc-300/90" : ""
            }`}
            type="text"
            placeholder={placeHolder}
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              isFocused ? "opacity-100" : "opacity-0"
            } bg-gradient-to-r from-amber-300/5 via-zinc-100/[0.03] to-amber-400/5`}
          />
        </div>

        <div className="w-px bg-zinc-500/35" />

        <button
          type="submit"
          className={`relative px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-black transition-all duration-300 ${
            isFocused
              ? "bg-gradient-to-r from-amber-300 to-amber-500"
              : "bg-gradient-to-r from-zinc-300 to-zinc-400"
          } hover:from-amber-300 hover:to-amber-500 hover:shadow-[0_8px_18px_rgba(245,158,11,0.28)]`}
        >
          <span className="relative z-10 flex items-center gap-2">
            Buscar
            <FaSearch className="text-[10px] transition-transform duration-300 group-hover:rotate-12" />
          </span>

          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              isFocused ? "opacity-100" : "opacity-0"
            } bg-gradient-to-r from-amber-200/30 via-white/10 to-amber-200/30`}
          />

          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-full -translate-x-full -skew-x-12 transform bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 hover:translate-x-full" />
          </div>
        </button>
      </form>

      <div
        className={`pointer-events-none absolute -inset-[1px] rounded-xl transition-opacity duration-500 ${
          isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-70"
        } bg-gradient-to-r from-amber-300/20 via-zinc-100/10 to-amber-400/20`}
      />
      <div
        className={`pointer-events-none absolute inset-0 rounded-xl ring-1 transition-all duration-300 ${
          isFocused ? "ring-amber-300/40" : "ring-transparent"
          }`}
      />
    </div>
  );
};

export default SearchBar;