import { NextRequest, NextResponse } from "next/server";
import { getFloorDetail } from "@/lib/floorData";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const weekOffset = Number(req.nextUrl.searchParams.get("week") ?? 0);
  const floor = await getFloorDetail(params.id, weekOffset);
  if (!floor) {
    return NextResponse.json({ error: "Étage introuvable" }, { status: 404 });
  }
  return NextResponse.json(floor);
}
