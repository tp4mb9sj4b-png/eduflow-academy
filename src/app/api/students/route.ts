import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase();
  const students = await prisma.student.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { phone: { contains: q } },
          ],
        }
      : undefined,
    include: { enrollments: { include: { course: true } } },
    orderBy: { registeredAt: "desc" },
  });
  return NextResponse.json(students);
}

// Admin-only: enroll a student in a course (creates the Student if new).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { firstName, lastName, age, phone, email, level, courseId } = body;
  if (!firstName || !lastName || !courseId) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const student = await prisma.student.create({
    data: { firstName, lastName, age: Number(age) || 18, phone: phone ?? "", email: email ?? "", level: level ?? "Débutant" },
  });

  const enrollment = await prisma.enrollment.create({
    data: { studentId: student.id, courseId },
  });

  return NextResponse.json({ student, enrollment }, { status: 201 });
}
