"use client";

import { getServers } from "@/api/account/realms";
import {
  autocompleteArmoryCharacters,
  searchArmoryCharacters,
} from "@/features/armory/api/armoryApi";
import { CLASS_COLORS, WOW_CLASSES, WOW_RACES } from "@/features/armory/constants/equipmentSlots";
import type {
  ArmoryAutocompleteItem,
  ArmorySearchItem,
} from "@/features/armory/types/armory.types";
import { ServerModel } from "@/model/model";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "level", labelKey: "armory.search.sortLevel" },
  { value: "level_asc", labelKey: "armory.search.sortLevelAsc" },
  { value: "name", labelKey: "armory.search.sortName" },
] as const;

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface FilterDropdownOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  options: FilterDropdownOption[];
  onChange: (value: string) => void;
  accent?: "cyan" | "amber";
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  accent = "cyan",
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const ring =
    accent === "amber"
      ? "focus-within:ring-amber-400/25 focus-within:border-amber-400/50 hover:border-amber-400/35"
      : "focus-within:ring-cyan-400/25 focus-within:border-cyan-400/50 hover:border-cyan-400/35";

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label ?? options[0]?.label ?? "";

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200/70">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`group flex w-full items-center justify-between rounded-xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/95 via-slate-950/90 to-black/80 px-4 py-3 text-left text-sm font-medium text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.35)] transition focus:outline-none focus:ring-2 ${ring}`}
      >
        <span className="truncate pr-2">{selectedLabel}</span>
        <ChevronDownIcon
          className={`h-5 w-5 shrink-0 text-cyan-300/70 transition group-hover:text-cyan-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-40 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-cyan-500/25 bg-slate-950 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value || "__all__"} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition ${
                    active
                      ? accent === "amber"
                        ? "bg-amber-500/15 font-semibold text-amber-100"
                        : "bg-cyan-500/15 font-semibold text-cyan-100"
                      : "text-slate-200 hover:bg-slate-800/90 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface ArmoryPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  compact?: boolean;
}

function ArmoryPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  compact = false,
}: ArmoryPaginationProps) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);

  const btnBase =
    "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35";
  const btnActive = `${btnBase} border-cyan-400/40 bg-cyan-500/15 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.12)] hover:bg-cyan-500/25`;
  const btnGhost = `${btnBase} border-slate-600/50 bg-slate-900/60 text-slate-300 hover:border-cyan-400/30 hover:text-white`;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 ${
        compact ? "" : "rounded-xl border border-cyan-500/15 bg-slate-950/80 px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md"
      }`}
    >
      <p className="text-xs text-slate-400 sm:text-sm">
        {t("armory.pagination.showing", { from, to, total })}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          className={btnGhost}
        >
          <span aria-hidden>‹</span>
          {t("armory.pagination.prev")}
        </button>
        <span className="min-w-[5.5rem] rounded-lg border border-slate-700/60 bg-black/40 px-3 py-2 text-center text-xs font-bold tabular-nums text-cyan-200 sm:text-sm">
          {t("armory.pagination.page", { page: page + 1, totalPages })}
        </span>
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className={btnActive}
        >
          {t("armory.pagination.next")}
          <span aria-hidden>›</span>
        </button>
      </div>
    </div>
  );
}

const ArmorySearch = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [selectedServer, setSelectedServer] = useState("");
  const [selectedRealmId, setSelectedRealmId] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [raceFilter, setRaceFilter] = useState("");
  const [factionFilter, setFactionFilter] = useState("");
  const [sort, setSort] = useState("level");
  const [page, setPage] = useState(0);
  const [characters, setCharacters] = useState<ArmorySearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<ArmoryAutocompleteItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    getServers()
      .then(setServers)
      .catch(() => setServers([]));
  }, []);

  const selectedServerModel = servers.find((s) => s.name === selectedServer);

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await searchArmoryCharacters({
        name: debouncedSearch || undefined,
        class_id: classFilter ? Number(classFilter) : undefined,
        race_id: raceFilter ? Number(raceFilter) : undefined,
        faction: factionFilter || undefined,
        sort,
        page,
        size: PAGE_SIZE,
        realm: selectedServer || undefined,
        expansion_id: selectedServerModel
          ? Number(selectedServerModel.expansion)
          : undefined,
        realm_id: selectedRealmId,
      });
      setCharacters(response.characters);
      setTotal(response.total);
    } catch {
      setCharacters([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    classFilter,
    raceFilter,
    factionFilter,
    sort,
    page,
    selectedServer,
    selectedServerModel,
    selectedRealmId,
  ]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await autocompleteArmoryCharacters(
        searchTerm.trim(),
        selectedRealmId,
        selectedServer || undefined,
        selectedServerModel ? Number(selectedServerModel.expansion) : undefined
      );
      setSuggestions(results);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedRealmId, selectedServer, selectedServerModel]);

  const handleServerChange = (value: string) => {
    setSelectedServer(value);
    const server = servers.find((s) => s.name === value);
    setSelectedRealmId(server?.id);
    setPage(0);
  };

  const navigateToCharacter = (name: string) => {
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (selectedRealmId) params.set("realm_id", String(selectedRealmId));
    else if (selectedServer && selectedServerModel) {
      params.set("realm", selectedServer);
      params.set("expansion_id", selectedServerModel.expansion);
    }
    const query = params.toString();
    router.push(`/armory/${encodeURIComponent(name)}${query ? `?${query}` : ""}`);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const realmOptions: FilterDropdownOption[] = [
    { value: "", label: t("armory.search.allRealms") },
    ...servers.map((server) => ({ value: server.name, label: server.name })),
  ];
  const sortOptions: FilterDropdownOption[] = SORT_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));
  const characterHref = (name: string) => {
    const params = new URLSearchParams();
    if (selectedRealmId) params.set("realm_id", String(selectedRealmId));
    else if (selectedServer && selectedServerModel) {
      params.set("realm", selectedServer);
      params.set("expansion_id", selectedServerModel.expansion);
    }
    const query = params.toString();
    return `/armory/${encodeURIComponent(name)}${query ? `?${query}` : ""}`;
  };

  const pillInactive =
    "border-slate-600/50 bg-slate-900/50 text-slate-400 hover:border-slate-500/70 hover:text-slate-200";
  const pillActiveCyan =
    "border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.18)] ring-1 ring-cyan-400/25";

  return (
    <div className="space-y-5">
      {/* Search hero */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-black/90 p-5 shadow-[0_0_40px_rgba(34,211,238,0.08)] md:p-7">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative">
          <label className="mb-2 block text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
            {t("armory.search.name")}
          </label>
          <div className="relative mx-auto max-w-2xl">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
                setPage(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchTerm.trim()) {
                  navigateToCharacter(searchTerm.trim());
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder={t("armory.search.placeholder")}
              className="w-full rounded-xl border border-cyan-500/30 bg-black/50 py-3.5 pl-12 pr-4 text-base text-white placeholder:text-slate-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] focus:border-cyan-400/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-30 mt-2 max-h-52 w-full overflow-auto rounded-xl border border-cyan-500/20 bg-slate-950/95 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
                {suggestions.map((item) => (
                  <li key={item.name}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-200 transition hover:bg-cyan-500/10"
                      onMouseDown={() => navigateToCharacter(item.name)}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-slate-400">
                        {item.level} {item.class}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-700/50 bg-black/40 p-4 md:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <FilterDropdown
            label={t("armory.search.realm")}
            value={selectedServer}
            options={realmOptions}
            onChange={handleServerChange}
          />

          <FilterDropdown
            label={t("armory.search.sort")}
            value={sort}
            options={sortOptions}
            onChange={(value) => {
              setSort(value);
              setPage(0);
            }}
            accent="amber"
          />
        </div>

        {/* Faction pills */}
        <div className="mt-5">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200/70">
            {t("armory.search.faction")}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setFactionFilter("");
                setPage(0);
              }}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                !factionFilter ? pillActiveCyan : pillInactive
              }`}
            >
              {t("armory.search.all")}
            </button>
            <button
              type="button"
              onClick={() => {
                setFactionFilter("alliance");
                setPage(0);
              }}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                factionFilter === "alliance"
                  ? "border-sky-400/60 bg-sky-500/20 text-sky-100 shadow-[0_0_14px_rgba(56,189,248,0.2)] ring-1 ring-sky-400/30"
                  : pillInactive
              }`}
            >
              {t("armory.faction.alliance")}
            </button>
            <button
              type="button"
              onClick={() => {
                setFactionFilter("horde");
                setPage(0);
              }}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                factionFilter === "horde"
                  ? "border-rose-500/60 bg-rose-600/20 text-rose-100 shadow-[0_0_14px_rgba(244,63,94,0.2)] ring-1 ring-rose-500/30"
                  : pillInactive
              }`}
            >
              {t("armory.faction.horde")}
            </button>
          </div>
        </div>

        {/* Class pills */}
        <div className="mt-5">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200/70">
            {t("armory.search.class")}
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => {
                setClassFilter("");
                setPage(0);
              }}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                !classFilter ? pillActiveCyan : pillInactive
              }`}
            >
              {t("armory.search.all")}
            </button>
            {WOW_CLASSES.map((c) => {
              const active = classFilter === String(c.id);
              const color = CLASS_COLORS[c.id] ?? "#69CCF0";
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setClassFilter(String(c.id));
                    setPage(0);
                  }}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    active ? "ring-1" : pillInactive
                  }`}
                  style={
                    active
                      ? {
                          borderColor: color,
                          color,
                          backgroundColor: `${color}18`,
                          boxShadow: `0 0 14px -4px ${color}88`,
                        }
                      : undefined
                  }
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Race pills */}
        <div className="mt-5">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200/70">
            {t("armory.search.race")}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setRaceFilter("");
                setPage(0);
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                !raceFilter ? pillActiveCyan : pillInactive
              }`}
            >
              {t("armory.search.all")}
            </button>
            {WOW_RACES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRaceFilter(String(r.id));
                  setPage(0);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  raceFilter === String(r.id) ? pillActiveCyan : pillInactive
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky pagination — visible without scrolling the full list */}
      {!isLoading && characters.length > 0 && (
        <div className="sticky top-[4.5rem] z-20">
          <ArmoryPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Results */}
      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-black/30">
        {isLoading ? (
          <p className="p-8 text-center text-slate-400">{t("armory.loading")}</p>
        ) : characters.length === 0 ? (
          <p className="p-8 text-center text-slate-400">{t("armory.search.empty")}</p>
        ) : (
          <ul className="divide-y divide-slate-800/80">
            {characters.map((char) => (
              <li key={char.id}>
                <Link
                  href={characterHref(char.name)}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition hover:bg-cyan-500/5 md:px-6 md:py-3.5"
                >
                  <div>
                    <span
                      className="text-lg font-semibold"
                      style={{ color: CLASS_COLORS[char.class_id] ?? "#fff" }}
                    >
                      {char.name}
                    </span>
                    <p className="text-sm text-slate-400">
                      {t("armory.level")} {char.level} · {char.race} {char.class}
                      {char.guild_name ? ` · <${char.guild_name}>` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                      char.online === 1
                        ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                        : "text-slate-500"
                    }`}
                  >
                    {char.online === 1 ? t("armory.online") : t("armory.offline")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isLoading && characters.length > 0 && (
        <ArmoryPagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          compact
        />
      )}
    </div>
  );
};

export default ArmorySearch;
