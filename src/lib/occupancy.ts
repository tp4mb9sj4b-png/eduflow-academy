// Centralized occupancy -> color logic used by both the API (server) and the
// 3D scene / dashboard (client) so the mapping is always consistent.

export type OccupancyTag = "free" | "light" | "busy" | "almost" | "full";

export const OCCUPANCY_COLORS: Record<OccupancyTag, string> = {
  free: "#22C55E",
  light: "#86EFAC",
  busy: "#EAB308",
  almost: "#F97316",
  full: "#EF4444",
};

export const OCCUPANCY_LABELS: Record<OccupancyTag, string> = {
  free: "Entièrement libre",
  light: "Quelques cours",
  busy: "Quelques cours",
  almost: "Presque complet",
  full: "Complet",
};

/**
 * Given a 0-100 percentage of seats booked across a floor's courses this week,
 * returns the occupancy tag used to color the floor in the 3D scene.
 *
 * 100% libre -> vert, 30% occupé -> vert clair, 60% -> jaune,
 * 85% -> orange, 100% réservé -> rouge.
 */
export function occupancyToTag(percentBooked: number): OccupancyTag {
  if (percentBooked <= 0) return "free";
  if (percentBooked < 40) return "light";
  if (percentBooked < 75) return "busy";
  if (percentBooked < 100) return "almost";
  return "full";
}

export function occupancyToColor(percentBooked: number): string {
  return OCCUPANCY_COLORS[occupancyToTag(percentBooked)];
}
