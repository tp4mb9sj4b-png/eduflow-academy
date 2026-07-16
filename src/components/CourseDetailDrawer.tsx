"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Calendar, Clock, Hash, ArrowUpRight } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { useCourse } from "@/hooks/useData";
import { cn, DAY_LABELS_FULL, formatHour } from "@/lib/utils";
import { TeacherCard } from "./TeacherCard";
import { RoomInfoCard } from "./RoomInfoCard";
import { StudentTable } from "./StudentTable";

const STATUS_STYLE: Record<string, string> = {
  Disponible: "bg-status-free/15 text-emerald-700 dark:text-emerald-400",
  Complet: "bg-status-full/15 text-red-700 dark:text-red-400",
  Annulé: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export function CourseDetailDrawer() {
  const selectedCourseId = useUIStore((s) => s.selectedCourseId);
  const selectCourse = useUIStore((s) => s.selectCourse);
  const selectFloor = useUIStore((s) => s.selectFloor);
  const setHighlightedFloor = useUIStore((s) => s.setHighlightedFloor);
  const { data: course } = useCourse(selectedCourseId);

  useEffect(() => {
    if (course?.room.floorId) {
      setHighlightedFloor(course.room.floorId);
      return () => setHighlightedFloor(null);
    }
  }, [course?.room.floorId, setHighlightedFloor]);

  return (
    <AnimatePresence>
      {selectedCourseId && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => selectCourse(null)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-y-auto bg-slate-50 shadow-2xl dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {course?.title ?? "Chargement..."}
                </h2>
                {course && (
                  <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_STYLE[course.status])}>
                    {course.status}
                  </span>
                )}
              </div>
              <button
                onClick={() => selectCourse(null)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {course && (
              <div className="flex-1 space-y-4 px-6 py-4">
                {/* General info */}
                <div className="grid grid-cols-2 gap-3 rounded-xl2 border border-slate-200 bg-white p-4 text-xs shadow-softer dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
                  <InfoItem icon={<Calendar size={12} />} label="Jour" value={DAY_LABELS_FULL[course.dayOfWeek]} />
                  <InfoItem icon={<Clock size={12} />} label="Horaire" value={`${formatHour(course.startHour)} – ${formatHour(course.endHour)}`} />
                  <InfoItem icon={<Clock size={12} />} label="Durée" value={`${(course.endHour - course.startHour).toFixed(1)}h`} />
                  <InfoItem icon={<Hash size={12} />} label="Type" value={course.type} />
                  <InfoItem icon={<Hash size={12} />} label="Places" value={`${course.enrolledCount}/${course.maxSeats}`} />
                  <InfoItem icon={<Hash size={12} />} label="Restantes" value={String(course.remainingSeats)} />
                </div>

                <button
                  onClick={() => {
                    selectCourse(null);
                    selectFloor(course.room.floorId);
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl2 bg-eduflow/10 px-4 py-2 text-sm font-medium text-eduflow transition hover:bg-eduflow/20"
                >
                  Voir cet étage dans le bâtiment 3D
                  <ArrowUpRight size={14} />
                </button>

                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Professeur</h3>
                  <TeacherCard teacher={course.teacher} />
                </section>

                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Salle</h3>
                  <RoomInfoCard room={course.room} />
                </section>

                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Élèves inscrits ({course.students.length})
                  </h3>
                  <StudentTable students={course.students} />
                </section>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-slate-400">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 font-medium text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  );
}
