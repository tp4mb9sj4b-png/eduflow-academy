"use client";

import { DoorOpen, Users2, MonitorSmartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoomDTO } from "@/types";

export function RoomInfoCard({ room }: { room: RoomDTO }) {
  return (
    <div className="rounded-xl2 border border-slate-200 bg-white p-4 shadow-softer dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
          <DoorOpen size={15} className="text-eduflow" />
          {room.name} · {room.floorName}
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            room.status === "Libre" && "bg-status-free/15 text-emerald-700 dark:text-emerald-400",
            room.status === "Occupée" && "bg-status-busy/15 text-amber-700 dark:text-amber-400",
            room.status === "Maintenance" && "bg-status-full/15 text-red-700 dark:text-red-400"
          )}
        >
          {room.status}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <Users2 size={12} />
        {room.presentCount}/{room.capacity} élèves présents
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {room.equipment.map((eq) => (
          <span
            key={eq}
            className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <MonitorSmartphone size={10} />
            {eq}
          </span>
        ))}
      </div>
    </div>
  );
}
