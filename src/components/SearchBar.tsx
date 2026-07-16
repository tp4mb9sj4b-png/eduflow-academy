"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/lib/store";
import { useCourses } from "@/hooks/useData";

const TYPES = ["all", "Langues", "Informatique", "IA", "Soutien scolaire", "Accompagnement", "Formation pro"];

export function SearchBar() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const filterType = useUIStore((s) => s.filterType);
  const setFilterType = useUIStore((s) => s.setFilterType);
  const setHighlightedFloor = useUIStore((s) => s.setHighlightedFloor);
  const weekOffset = useUIStore((s) => s.weekOffset);

  const [focused, setFocused] = useState(false);
  const { data: results } = useCourses({
    q: searchQuery || undefined,
    type: filterType,
    week: weekOffset,
  });

  useEffect(() => {
    if (searchQuery && results && results.length > 0) {
      setHighlightedFloor(results[0].room.floorId);
    } else {
      setHighlightedFloor(null);
    }
  }, [searchQuery, results, setHighlightedFloor]);

  return (
    <div className="relative flex w-full max-w-md items-center gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-xl2 border border-slate-200 bg-white px-3 py-2 shadow-softer dark:border-slate-700 dark:bg-slate-900">
        <Search size={15} className="text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Rechercher une formation..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
        />
      </div>
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="rounded-xl2 border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600 shadow-softer outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t === "all" ? "Tous les types" : t}
          </option>
        ))}
      </select>

      <AnimatePresence>
        {focused && searchQuery && results && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute left-0 top-full z-20 mt-1 w-full max-w-md overflow-hidden rounded-xl2 border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900"
          >
            {results.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="border-b border-slate-100 px-3 py-2 text-xs last:border-0 dark:border-slate-800"
              >
                <div className="font-medium text-slate-800 dark:text-slate-100">{c.title}</div>
                <div className="text-slate-400">
                  {c.room.floorName} · {c.room.name}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
