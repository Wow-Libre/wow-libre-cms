"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Navbar } from "@/features/navbar";
import type { OnlineCharacterDto } from "@/types/onlineUsers";
import {
  getClassNameById,
  getFactionByRaceId,
  getRaceNameById,
} from "@/constants/azerothcore";

type FactionKey = "ALLIANCE" | "HORDE" | "UNKNOWN";

type OnlineCharacterView = OnlineCharacterDto & {
  faction: FactionKey;
  raceName: string;
  className: string;
};

const groupBy = <T,>(items: T[], keyFn: (item: T) => string) => {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    groups[key] = groups[key] ? [...groups[key], item] : [item];
  }
  return groups;
};

export default function OnlineUsersPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<OnlineCharacterDto[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/online-users/characters", {
          cache: "no-store",
        });
        const data = await response.json();
        setCharacters(Array.isArray(data.characters) ? data.characters : []);
      } catch (error) {
        setCharacters([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const views = useMemo<OnlineCharacterView[]>(() => {
    return characters.map((character) => {
      const faction = getFactionByRaceId(character.raceId);
      return {
        ...character,
        faction,
        raceName: getRaceNameById(character.raceId),
        className: getClassNameById(character.classId),
      };
    });
  }, [characters]);

  const groupedByFaction = useMemo(() => {
    const groups = groupBy(views, (character) => character.faction);
    const order: FactionKey[] = ["ALLIANCE", "HORDE", "UNKNOWN"];
    return order.map((key) => ({
      key,
      items: groups[key] || [],
    }));
  }, [views]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-midnight text-white px-4 sm:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                {t("navbar.connected-users")}
              </h1>
              <p className="text-slate-300 mt-1">
                {t("online-users.page.subtitle")}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg border border-slate-700 hover:border-amber-500/60 hover:text-amber-300 transition-all"
            >
              {t("online-users.page.back-home")}
            </Link>
          </div>

          {loading ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
              {t("online-users.page.loading")}
            </div>
          ) : views.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 text-slate-300">
              {t("navbar.connected-users-empty")}
            </div>
          ) : (
            <div className="space-y-8">
              {groupedByFaction.map(({ key, items }) => (
                <FactionSection key={key} faction={key} characters={items} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FactionSection({
  faction,
  characters,
}: {
  faction: FactionKey;
  characters: OnlineCharacterView[];
}) {
  const { t } = useTranslation();

  const title =
    faction === "ALLIANCE"
      ? t("online-users.faction.alliance")
      : faction === "HORDE"
      ? t("online-users.faction.horde")
      : t("online-users.faction.unknown");

  const grouped = useMemo(() => {
    const byRace = groupBy(characters, (c) => c.raceName);
    const sortedRaces = Object.keys(byRace).sort((a, b) => a.localeCompare(b));
    const result = sortedRaces.map((race) => {
      const byClass = groupBy(byRace[race], (c) => c.className);
      const sortedClasses = Object.keys(byClass).sort((a, b) =>
        a.localeCompare(b)
      );
      return {
        race,
        classes: sortedClasses.map((className) => ({
          className,
          items: byClass[className]
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name)),
        })),
      };
    });
    return result;
  }, [characters]);

  if (characters.length === 0) return null;

  return (
    <section className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-sm text-slate-300">
          {t("online-users.page.total")}:{" "}
          <span className="text-white font-semibold">{characters.length}</span>
        </span>
      </div>

      <div className="p-6 space-y-6">
        {grouped.map((raceGroup) => (
          <div key={raceGroup.race}>
            <h3 className="text-lg font-semibold text-amber-300 mb-3">
              {raceGroup.race}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {raceGroup.classes.map((classGroup) => (
                <div
                  key={classGroup.className}
                  className="bg-slate-950/40 border border-slate-800 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">{classGroup.className}</span>
                    <span className="text-sm text-slate-300">
                      {classGroup.items.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {classGroup.items.map((character) => (
                      <div
                        key={`${character.name}-${character.level}-${character.classId}-${character.raceId}`}
                        className="flex items-center justify-between border-b border-slate-800/70 last:border-none pb-2 last:pb-0"
                      >
                        <span className="text-white">{character.name}</span>
                        <span className="text-sm text-slate-300">
                          {t("online-users.page.level")} {character.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
