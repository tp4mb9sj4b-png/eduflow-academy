"use client";

import useSWR from "swr";
import type { CourseDTO, DashboardDTO, FloorDTO } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useFloors(weekOffset = 0) {
  return useSWR<FloorDTO[]>(`/api/floors?week=${weekOffset}`, fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: true,
  });
}

export function useFloorDetail(floorId: string | null, weekOffset = 0) {
  return useSWR(
    floorId ? `/api/floors/${floorId}?week=${weekOffset}` : null,
    fetcher,
    { refreshInterval: 10000 }
  );
}

export function useCourse(courseId: string | null) {
  return useSWR<CourseDTO>(courseId ? `/api/courses/${courseId}` : null, fetcher, {
    refreshInterval: 10000,
  });
}

export function useDashboard(weekOffset = 0) {
  return useSWR<DashboardDTO>(`/api/dashboard?week=${weekOffset}`, fetcher, {
    refreshInterval: 15000,
  });
}

export function useCourses(params: { q?: string; type?: string; week?: number } = {}) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.type) search.set("type", params.type);
  search.set("week", String(params.week ?? 0));
  return useSWR<CourseDTO[]>(`/api/courses?${search.toString()}`, fetcher);
}

export { fetcher };
