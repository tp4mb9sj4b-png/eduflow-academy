"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { addDays, addWeeks, format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { useUIStore } from "@/lib/store";
import { cn, DAY_LABELS, formatHour } from "@/lib/utils";
import type { CourseDTO } from "@/types";

const START_HOUR = 8;
const END_HOUR = 20;
const ROW_HEIGHT = 52; // px per hour

const TYPE_COLORS: Record<string, string> = {
  Langues: "#1D8CF8",
  Informatique: "#8B5CF6",
  IA: "#EC4899",
  "Soutien scolaire": "#F59E0B",
  Accompagnement: "#10B981",
  "Formation pro": "#0EA5E9",
};

function typeColor(type: string) {
  return TYPE_COLORS[type] ?? "#64748B";
}

interface WeeklyCalendarProps {
  courses: CourseDTO[];
  isLoading?: boolean;
}

export function WeeklyCalendar({ courses, isLoading }: WeeklyCalendarProps) {
  const weekOffset = useUIStore((s) => s.weekOffset);
  const setWeekOffset = useUIStore((s) => s.setWeekOffset);
  const selectCourse = useUIStore((s) => s.selectCourse);

  const weekStart = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset);
  const weekEnd = addDays(weekStart, 6);

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl2 border border-slate-200 bg-white shadow-softer dark:border-slate-700 dark:bg-slate-900">
      {/* Header: week navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {format(weekStart, "d MMM", { locale: fr })} — {format(weekEnd, "d MMM yyyy", { locale: fr })}
          </div>
          <div className="text-xs text-slate-400">{isLoading ? "Mise à jour..." : `${courses.length} cours cette semaine`}</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Semaine précédente"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Semaine suivante"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid" style={{ gridTemplateColumns: "56px repeat(7, minmax(120px, 1fr))" }}>
          {/* day headers */}
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900" />
          {DAY_LABELS.map((d, i) => (
            <div
              key={d}
              className="sticky top-0 z-10 border-b border-l border-slate-100 bg-white px-2 py-2 text-center text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              {d}
              <div className="text-[10px] font-normal text-slate-400">
                {format(addDays(weekStart, i), "d MMM", { locale: fr })}
              </div>
            </div>
          ))}

          {/* hour rows + grid lines */}
          {hours.map((h) => (
            <div key={`label-${h}`} className="border-b border-slate-100 px-1 py-0 text-right text-[10px] text-slate-400 dark:border-slate-800" style={{ height: ROW_HEIGHT }}>
              <span className="relative -top-2">{h}h</span>
            </div>
          ))}
          {hours.length > 0 &&
            DAY_LABELS.map((_, dayIdx) => (
              <div key={`col-${dayIdx}`} className="relative border-b border-l border-slate-100 dark:border-slate-800" style={{ height: ROW_HEIGHT * hours.length }}>
                {hours.map((h) => (
                  <div key={h} className="absolute left-0 right-0 border-b border-dashed border-slate-100 dark:border-slate-800" style={{ top: (h - START_HOUR) * ROW_HEIGHT, height: ROW_HEIGHT }} />
                ))}
                {courses
                  .filter((c) => c.dayOfWeek === dayIdx)
                  .map((course) => {
                    const top = (course.startHour - START_HOUR) * ROW_HEIGHT;
                    const height = Math.max((course.endHour - course.startHour) * ROW_HEIGHT - 4, 24);
                    const color = typeColor(course.type);
                    return (
                      <motion.button
                        key={course.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectCourse(course.id)}
                        className="absolute left-1 right-1 overflow-hidden rounded-lg px-2 py-1 text-left shadow-sm transition-shadow"
                        style={{ top, height, backgroundColor: `${color}1A`, borderLeft: `3px solid ${color}` }}
                      >
                        <div className="truncate text-[11px] font-semibold" style={{ color }}>
                          {course.title}
                        </div>
                        <div className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                          {formatHour(course.startHour)}–{formatHour(course.endHour)} · {course.room.name}
                        </div>
                        {height > 40 && (
                          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                            <Users size={10} />
                            {course.remainingSeats} places restantes
                          </div>
                        )}
                        <span
                          className={cn(
                            "absolute right-1 top-1 h-1.5 w-1.5 rounded-full",
                            course.status === "Complet" && "bg-status-full",
                            course.status === "Disponible" && "bg-status-free",
                            course.status === "Annulé" && "bg-slate-400"
                          )}
                        />
                      </motion.button>
                    );
                  })}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
