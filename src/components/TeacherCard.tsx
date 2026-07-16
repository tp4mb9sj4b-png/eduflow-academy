"use client";

import { Mail, Phone, Clock, BookOpen } from "lucide-react";
import type { TeacherDTO } from "@/types";

export function TeacherCard({ teacher }: { teacher: TeacherDTO }) {
  const initials = `${teacher.firstName[0] ?? ""}${teacher.lastName[0] ?? ""}`;
  return (
    <div className="flex items-start gap-3 rounded-xl2 border border-slate-200 bg-white p-4 shadow-softer dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-eduflow-light text-sm font-semibold text-eduflow-dark dark:bg-slate-800 dark:text-eduflow">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">
          {teacher.firstName} {teacher.lastName}
        </div>
        <div className="flex items-center gap-1 text-xs text-eduflow">
          <BookOpen size={12} />
          {teacher.subject}
        </div>
        <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
          <span className="flex items-center gap-1">
            <Phone size={12} /> {teacher.phone}
          </span>
          <span className="flex items-center gap-1 truncate">
            <Mail size={12} /> {teacher.email}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {teacher.availability}
          </span>
          <span className="flex items-center gap-1">
            {teacher.hoursThisWeek.toFixed(1)}h enseignées cette semaine
          </span>
        </div>
      </div>
    </div>
  );
}
