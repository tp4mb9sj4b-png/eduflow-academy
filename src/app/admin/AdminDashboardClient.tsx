"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Home, CalendarSync } from "lucide-react";
import { DashboardCards } from "@/components/DashboardCards";
import { AdminBookingForm } from "@/components/AdminBookingForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AdminDashboardClient({ userName }: { userName: string }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-6 py-3 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl2 bg-eduflow text-sm font-bold text-white">
            EF
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Tableau de bord</div>
            <div className="text-[11px] text-slate-400">{userName}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl2 border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Home size={14} />
            Voir le bâtiment
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-1.5 rounded-xl2 bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <DashboardCards />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AdminBookingForm />
          </div>
          <div className="rounded-xl2 border border-slate-200 bg-white p-4 shadow-softer dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <CalendarSync size={15} className="text-eduflow" />
              Synchronisation calendrier
            </h3>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Connectez votre agenda pour synchroniser les cours EduFlow (nécessite vos clés API,
              voir le README).
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="/api/integrations/google"
                className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Connecter Google Calendar
              </a>
              <a
                href="/api/integrations/outlook"
                className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Connecter Outlook Calendar
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
