import { NextRequest, NextResponse } from "next/server";
import { getFloorsWithOccupancy } from "@/lib/floorData";

export async function GET(req: NextRequest) {
  const weekOffset = Number(req.nextUrl.searchParams.get("week") ?? 0);
  const floors = await getFloorsWithOccupancy(weekOffset);
  return NextResponse.json(floors);
}
