import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Admin-only: update a student's profile, or (via ?courseId=) their
// attendance/payment status for one specific enrollment.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId");
  const body = await req.json();

  if (courseId) {
    const { attendance, payment } = body;
    const enrollment = await prisma.enrollment.update({
      where: { studentId_courseId: { studentId: params.id, courseId } },
      data: {
        ...(attendance ? { attendance } : {}),
        ...(payment ? { payment } : {}),
      },
    });
    return NextResponse.json(enrollment);
  }

  const data: Record<string, unknown> = {};
  for (const key of ["firstName", "lastName", "age", "phone", "email", "level"]) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  const student = await prisma.student.update({ where: { id: params.id }, data });
  return NextResponse.json(student);
}

// Admin-only: remove a student entirely, or just unenroll from one course
// via ?courseId=
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId");
  if (courseId) {
    await prisma.enrollment.delete({
      where: { studentId_courseId: { studentId: params.id, courseId } },
    });
    return NextResponse.json({ ok: true });
  }

  await prisma.student.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
