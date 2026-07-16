"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { motion } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import { fetcher } from "@/hooks/useData";
import { DAY_LABELS_FULL } from "@/lib/utils";
import type { RoomDTO, TeacherDTO } from "@/types";

const TYPES = ["Langues", "Informatique", "IA", "Soutien scolaire", "Accompagnement", "Formation pro"];

export function AdminBookingForm() {
  const { mutate } = useSWRConfig();
  const { data: rooms } = useSWR<RoomDTO[]>("/api/rooms", fetcher);
  const { data: teachers } = useSWR<TeacherDTO[]>("/api/teachers", fetcher);

  const [form, setForm] = useState({
    title: "",
    type: TYPES[0],
    roomId: "",
    teacherId: "",
    dayOfWeek: 0,
    startHour: 9,
    endHour: 10,
    maxSeats: 15,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.roomId || !form.teacherId) return;
    setStatus("saving");
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setStatus("done");
      mutate((key) => typeof key === "string" && key.startsWith("/api/floors"));
      mutate((key) => typeof key === "string" && key.startsWith("/api/courses"));
      mutate((key) => typeof key === "string" && key.startsWith("/api/dashboard"));
      setForm((f) => ({ ...f, title: "" }));
      setTimeout(() => setStatus("idle"), 1500);
    } else {
      setStatus("error");
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl2 border border-slate-200 bg-white p-4 shadow-softer dark:border-slate-800 dark:bg-slate-900"
    >
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
        <CalendarPlus size={15} className="text-eduflow" />
        Réserver un créneau
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Nom de la formation"
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-eduflow/30 dark:border-slate-700 dark:bg-slate-800"
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={form.roomId}
          onChange={(e) => setForm({ ...form, roomId: e.target.value })}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800"
          required
        >
          <option value="">Salle...</option>
          {rooms?.map((r) => (
            <option key={r.id} value={r.id}>{r.name} ({r.floorName})</option>
          ))}
        </select>
        <select
          value={form.teacherId}
          onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800"
          required
        >
          <option value="">Professeur...</option>
          {teachers?.map((t) => (
            <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
          ))}
        </select>
        <select
          value={form.dayOfWeek}
          onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800"
        >
          {DAY_LABELS_FULL.map((d, i) => (
            <option key={d} value={i}>{d}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            step={0.5}
            value={form.startHour}
            onChange={(e) => setForm({ ...form, startHour: Number(e.target.value) })}
            className="w-1/2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            type="number"
            step={0.5}
            value={form.endHour}
            onChange={(e) => setForm({ ...form, endHour: Number(e.target.value) })}
            className="w-1/2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={status === "saving"}
        className="mt-3 w-full rounded-lg bg-eduflow py-1.5 text-xs font-medium text-white transition hover:bg-eduflow-dark disabled:opacity-60"
      >
        {status === "saving" ? "Enregistrement..." : status === "done" ? "Ajouté ✓" : "Ajouter au planning"}
      </button>
    </motion.form>
  );
}
