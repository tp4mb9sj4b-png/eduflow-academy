import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapTeacher } from "@/lib/floorData";

export async function GET() {
  const teachers = await prisma.teacher.findMany({
    include: { courses: true },
    orderBy: { lastName: "asc" },
  });

  const withHours = teachers.map((t) => {
    const hoursThisWeek = t.courses.reduce(
      (sum, c) => sum + (c.endHour - c.startHour),
      0
    );
    return mapTeacher(t, hoursThisWeek);
  });

  return NextResponse.json(withHours);
}
