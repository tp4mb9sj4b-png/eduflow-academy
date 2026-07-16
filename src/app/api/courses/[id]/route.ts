import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapCourse } from "@/lib/floorData";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const includeArgs = {
  teacher: true,
  room: { include: { floor: true } },
  students: { include: { student: true } },
} as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: includeArgs,
  });
  if (!course) return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
  return NextResponse.json(mapCourse(course));
}

// Admin-only: change schedule, room, teacher, status, or manage enrollments.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ["title", "type", "roomId", "teacherId", "dayOfWeek", "startHour", "endHour", "maxSeats", "status"]) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  const course = await prisma.course.update({
    where: { id: params.id },
    data,
    include: includeArgs,
  });

  return NextResponse.json(mapCourse(course));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
