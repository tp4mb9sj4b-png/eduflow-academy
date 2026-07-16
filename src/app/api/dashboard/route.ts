import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DashboardDTO } from "@/types";

export async function GET(req: NextRequest) {
  const weekOffset = Number(req.nextUrl.searchParams.get("week") ?? 0);

  const floors = await prisma.floor.findMany({
    orderBy: { level: "asc" },
    include: {
      rooms: {
        include: {
          courses: { where: { weekOffset }, include: { students: true } },
        },
      },
    },
  });

  const studentsByFloor: { floorName: string; count: number }[] = [];
  const studentsByRoom: { roomName: string; floorName: string; count: number }[] = [];
  const roomOccupancy: { roomName: string; floorName: string; percent: number }[] = [];
  const floorOccupancy: { floorName: string; percent: number }[] = [];

  let totalStudents = 0;
  let coursesInProgress = 0;
  let freeRooms = 0;
  let totalRooms = 0;
  const now = new Date();
  const currentDay = (now.getDay() + 6) % 7; // 0=Lundi
  const currentHour = now.getHours() + now.getMinutes() / 60;

  for (const floor of floors) {
    let floorSeats = 0;
    let floorBooked = 0;
    let floorStudents = 0;

    for (const room of floor.rooms) {
      totalRooms++;
      let roomSeats = 0;
      let roomBooked = 0;
      for (const course of room.courses) {
        roomSeats += course.maxSeats;
        roomBooked += course.students.length;
        floorStudents += course.students.length;
        if (course.dayOfWeek === currentDay && currentHour >= course.startHour && currentHour < course.endHour) {
          coursesInProgress++;
        }
      }
      floorSeats += roomSeats;
      floorBooked += roomBooked;

      const roomPercent = roomSeats > 0 ? Math.round((roomBooked / roomSeats) * 100) : 0;
      roomOccupancy.push({ roomName: room.name, floorName: floor.name, percent: roomPercent });
      studentsByRoom.push({ roomName: room.name, floorName: floor.name, count: roomBooked });
      if (room.status === "Libre" && roomPercent === 0) freeRooms++;
    }

    totalStudents += floorStudents;
    studentsByFloor.push({ floorName: floor.name, count: floorStudents });
    floorOccupancy.push({
      floorName: floor.name,
      percent: floorSeats > 0 ? Math.round((floorBooked / floorSeats) * 100) : 0,
    });
  }

  const teachersPresent = await prisma.teacher.count({
    where: {
      courses: {
        some: { dayOfWeek: currentDay, startHour: { lte: currentHour }, endHour: { gt: currentHour } },
      },
    },
  });

  const coursesTodayWithEnrollments = await prisma.course.findMany({
    where: { weekOffset, dayOfWeek: currentDay },
    include: { students: true },
  });
  const seatsRemaining = coursesTodayWithEnrollments.reduce(
    (sum, c) => sum + Math.max(c.maxSeats - c.students.length, 0),
    0
  );

  const payload: DashboardDTO = {
    totalStudents,
    studentsByFloor,
    studentsByRoom,
    roomOccupancy,
    floorOccupancy,
    coursesInProgress,
    freeRooms,
    teachersPresent,
    seatsRemainingToday: seatsRemaining,
  };

  return NextResponse.json(payload);
}
