import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapCourse } from "@/lib/floorData";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase();
  const type = req.nextUrl.searchParams.get("type");
  const weekOffset = Number(req.nextUrl.searchParams.get("week") ?? 0);

  const courses = await prisma.course.findMany({
    where: {
      weekOffset,
      ...(type && type !== "all" ? { type } : {}),
      ...(q
        ? { title: { contains: q } }
        : {}),
    },
    include: {
      teacher: true,
      room: { include: { floor: true } },
      students: { include: { student: true } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startHour: "asc" }],
  });

  return NextResponse.json(courses.map(mapCourse));
}

// Admin-only: book a new course in an empty room slot.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { title, type, roomId, teacherId, dayOfWeek, startHour, endHour, maxSeats } = body;

  if (!title || !roomId || !teacherId) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: {
      title,
      type: type ?? "Langues",
      roomId,
      teacherId,
      dayOfWeek: Number(dayOfWeek) ?? 0,
      startHour: Number(startHour) ?? 9,
      endHour: Number(endHour) ?? 10,
      maxSeats: Number(maxSeats) ?? 15,
      status: "Disponible",
    },
    include: {
      teacher: true,
      room: { include: { floor: true } },
      students: { include: { student: true } },
    },
  });

  return NextResponse.json(mapCourse(course), { status: 201 });
}
