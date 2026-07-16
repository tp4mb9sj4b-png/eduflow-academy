import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapRoom } from "@/lib/floorData";

export async function GET() {
  const rooms = await prisma.room.findMany({
    include: { floor: true, courses: { include: { students: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(rooms.map(mapRoom));
}
