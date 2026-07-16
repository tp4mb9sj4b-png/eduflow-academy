"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloorDrawer } from "@/components/FloorDrawer";
import { CourseDetailDrawer } from "@/components/CourseDetailDrawer";
import { OCCUPANCY_COLORS, OCCUPANCY_LABELS } from "@/lib/occupancy";

const Building3D = dynamic(() => import("@/components/Building3D").then((m) => m.Building3D), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] w-full items-center justify-center text-sm text-slate-400 md:h-[640px]">
      Chargement du bâtiment...
    </div>
  ),
});

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-6 py-3 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl2 bg-eduflow text-sm font-bold text-white">
            EF
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">EduFlow Academy</span>
        </div>
        <SearchBar />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-xl2 bg-eduflow px-3 py-2 text-xs font-medium text-white shadow-softer transition hover:bg-eduflow-dark"
          >
            <LayoutDashboard size={14} />
            Espace admin
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Votre bâtiment, en direct.
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Survolez un étage pour voir son occupation, cliquez pour découvrir le planning de la
            semaine — salles, professeurs et places disponibles, en temps réel.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8"
        >
          <Building3D />
        </motion.div>

        <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-4">
          {(Object.keys(OCCUPANCY_COLORS) as (keyof typeof OCCUPANCY_COLORS)[]).map((tag) => (
            <div key={tag} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: OCCUPANCY_COLORS[tag] }} />
              {OCCUPANCY_LABELS[tag]}
            </div>
          ))}
        </div>
      </section>

      <FloorDrawer />
      <CourseDetailDrawer />
    </main>
  );
}
