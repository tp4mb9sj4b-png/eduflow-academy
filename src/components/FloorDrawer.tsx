"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, DoorOpen, Users2 } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { useFloorDetail } from "@/hooks/useData";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { cn } from "@/lib/utils";

export function FloorDrawer() {
  const selectedFloorId = useUIStore((s) => s.selectedFloorId);
  const selectFloor = useUIStore((s) => s.selectFloor);
  const weekOffset = useUIStore((s) => s.weekOffset);
  const { data: floor, isLoading } = useFloorDetail(selectedFloorId, weekOffset);

  return (
    <AnimatePresence>
      {selectedFloorId && (
        <motion.div
          className="fixed inset-0 z-40 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => selectFloor(null)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-slate-50 shadow-2xl dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {floor?.name ?? "Chargement..."}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{floor?.subtitle}</p>
              </div>
              <button
                onClick={() => selectFloor(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {floor && (
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {floor.rooms.map((room: any) => (
                    <div
                      key={room.id}
                      className="rounded-xl2 border border-slate-200 bg-white p-3 shadow-softer dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-100">
                        <DoorOpen size={14} className="text-eduflow" />
                        {room.name}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Users2 size={12} />
                        {room.presentCount}/{room.capacity} places
                      </div>
                      <span
                        className={cn(
                          "mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                          room.status === "Libre" && "bg-status-free/15 text-emerald-700 dark:text-emerald-400",
                          room.status === "Occupée" && "bg-status-busy/15 text-amber-700 dark:text-amber-400",
                          room.status === "Maintenance" && "bg-status-full/15 text-red-700 dark:text-red-400"
                        )}
                      >
                        {room.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ height: 560 }}>
                <WeeklyCalendar courses={floor?.courses ?? []} isLoading={isLoading} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
