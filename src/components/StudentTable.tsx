"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { StudentDTO } from "@/types";

type SortKey = "lastName" | "age" | "level" | "registeredAt";

const ATTENDANCE_STYLE: Record<string, string> = {
  Présent: "bg-status-free/15 text-emerald-700 dark:text-emerald-400",
  Absent: "bg-status-full/15 text-red-700 dark:text-red-400",
  Retard: "bg-status-busy/15 text-amber-700 dark:text-amber-400",
  "Non renseigné": "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const PAYMENT_STYLE: Record<string, string> = {
  "À jour": "bg-status-free/15 text-emerald-700 dark:text-emerald-400",
  "En attente": "bg-status-busy/15 text-amber-700 dark:text-amber-400",
  "En retard": "bg-status-full/15 text-red-700 dark:text-red-400",
};

export function StudentTable({ students }: { students: StudentDTO[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("lastName");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const list = students.filter(
      (s) =>
        !q ||
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.phone.includes(q)
    );
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "lastName") cmp = a.lastName.localeCompare(b.lastName);
      if (sortKey === "age") cmp = a.age - b.age;
      if (sortKey === "level") cmp = a.level.localeCompare(b.level);
      if (sortKey === "registeredAt")
        cmp = new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
      return sortAsc ? cmp : -cmp;
    });
  }, [students, query, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  return (
    <div className="rounded-xl2 border border-slate-200 bg-white shadow-softer dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
        <Search size={14} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom, prénom ou téléphone..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
        />
        <span className="text-xs text-slate-400">{filtered.length} élève(s)</span>
      </div>

      <div className="max-h-72 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <Th label="Élève" onClick={() => toggleSort("lastName")} />
              <Th label="Âge" onClick={() => toggleSort("age")} />
              <th className="px-3 py-2 font-medium">Téléphone</th>
              <Th label="Niveau" onClick={() => toggleSort("level")} />
              <Th label="Inscrit le" onClick={() => toggleSort("registeredAt")} />
              <th className="px-3 py-2 font-medium">Présence</th>
              <th className="px-3 py-2 font-medium">Paiement</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">
                  {s.firstName} {s.lastName}
                </td>
                <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{s.age}</td>
                <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{s.phone}</td>
                <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{s.level}</td>
                <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                  {format(new Date(s.registeredAt), "dd/MM/yyyy")}
                </td>
                <td className="px-3 py-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", ATTENDANCE_STYLE[s.attendance])}>
                    {s.attendance}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", PAYMENT_STYLE[s.payment])}>
                    {s.payment}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                  Aucun élève trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <th className="px-3 py-2 font-medium">
      <button onClick={onClick} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200">
        {label}
        <ArrowUpDown size={11} />
      </button>
    </th>
  );
}
