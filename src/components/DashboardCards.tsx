"use client";

import { motion } from "framer-motion";
import { Users, DoorOpen, BookOpenCheck, GraduationCap, Armchair } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useDashboard } from "@/hooks/useData";
import { useUIStore } from "@/lib/store";

function StatCard({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl2 border border-slate-200 bg-white p-4 shadow-softer dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </motion.div>
  );
}

export function DashboardCards() {
  const weekOffset = useUIStore((s) => s.weekOffset);
  const { data } = useDashboard(weekOffset);

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={<Users size={16} />} label="Élèves totaux" value={data.totalStudents} delay={0} />
        <StatCard icon={<BookOpenCheck size={16} />} label="Cours en cours" value={data.coursesInProgress} delay={0.05} />
        <StatCard icon={<DoorOpen size={16} />} label="Salles libres" value={data.freeRooms} delay={0.1} />
        <StatCard icon={<GraduationCap size={16} />} label="Profs présents" value={data.teachersPresent} delay={0.15} />
        <StatCard icon={<Armchair size={16} />} label="Places dispo. aujourd'hui" value={data.seatsRemainingToday} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl2 border border-slate-200 bg-white p-4 shadow-softer dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Élèves par étage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.studentsByFloor}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="floorName" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1D8CF8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl2 border border-slate-200 bg-white p-4 shadow-softer dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Taux d&apos;occupation par étage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.floorOccupancy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="floorName" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} unit="%" />
              <Tooltip />
              <Bar dataKey="percent" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
