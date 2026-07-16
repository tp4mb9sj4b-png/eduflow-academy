import { prisma } from "./prisma";
import { occupancyToColor, occupancyToTag } from "./occupancy";
import type { CourseDTO, FloorDTO, RoomDTO, StudentDTO, TeacherDTO } from "@/types";

export async function getFloorsWithOccupancy(weekOffset = 0): Promise<FloorDTO[]> {
  const floors = await prisma.floor.findMany({
    orderBy: { level: "asc" },
    include: {
      rooms: {
        include: {
          courses: {
            where: { weekOffset },
            include: { students: true },
          },
        },
      },
    },
  });

  return floors.map((floor) => {
    let totalSeats = 0;
    let totalBooked = 0;
    let studentCount = 0;
    let anyOccupiedRoom = false;

    for (const room of floor.rooms) {
      if (room.status === "Occupée") anyOccupiedRoom = true;
      for (const course of room.courses) {
        totalSeats += course.maxSeats;
        totalBooked += course.students.length;
        studentCount += course.students.length;
      }
    }

    let percent = totalSeats > 0 ? Math.round((totalBooked / totalSeats) * 100) : 0;
    if (totalSeats === 0 && anyOccupiedRoom) percent = 60;

    return {
      id: floor.id,
      level: floor.level,
      name: floor.name,
      subtitle: floor.subtitle,
      kind: floor.kind,
      studentFacing: floor.studentFacing,
      occupancyPercent: percent,
      occupancyTag: occupancyToTag(percent),
      color: occupancyToColor(percent),
      roomCount: floor.rooms.length,
      studentCount,
    };
  });
}

export async function getFloorDetail(floorId: string, weekOffset = 0) {
  const floor = await prisma.floor.findUnique({
    where: { id: floorId },
    include: {
      rooms: {
        include: {
          courses: {
            where: { weekOffset },
            include: {
              teacher: true,
              students: { include: { student: true } },
              room: true,
            },
          },
        },
      },
    },
  });
  if (!floor) return null;

  const courses: CourseDTO[] = [];
  for (const room of floor.rooms) {
    for (const course of room.courses) {
      courses.push(mapCourse(course));
    }
  }

  return {
    id: floor.id,
    level: floor.level,
    name: floor.name,
    subtitle: floor.subtitle,
    kind: floor.kind,
    studentFacing: floor.studentFacing,
    rooms: floor.rooms.map(mapRoom),
    courses,
  };
}

export function mapRoom(room: any): RoomDTO {
  const presentCount =
    room.courses?.reduce(
      (sum: number, c: any) => sum + (c.students?.length ?? 0),
      0
    ) ?? 0;
  return {
    id: room.id,
    name: room.name,
    floorId: room.floorId,
    floorName: room.floor?.name ?? "",
    capacity: room.capacity,
    equipment: room.equipment ? room.equipment.split(",") : [],
    status: room.status,
    presentCount,
  };
}

export function mapTeacher(teacher: any, hoursThisWeek = 0): TeacherDTO {
  return {
    id: teacher.id,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    photoUrl: teacher.photoUrl,
    phone: teacher.phone,
    email: teacher.email,
    subject: teacher.subject,
    availability: teacher.availability,
    hoursThisWeek,
  };
}

export function mapStudent(enrollment: any): StudentDTO {
  const s = enrollment.student;
  return {
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    age: s.age,
    phone: s.phone,
    email: s.email,
    level: s.level,
    photoUrl: s.photoUrl,
    registeredAt: s.registeredAt,
    attendance: enrollment.attendance,
    payment: enrollment.payment,
  };
}

export function mapCourse(course: any): CourseDTO {
  const enrolledCount = course.students?.length ?? 0;
  return {
    id: course.id,
    title: course.title,
    type: course.type,
    dayOfWeek: course.dayOfWeek,
    startHour: course.startHour,
    endHour: course.endHour,
    weekOffset: course.weekOffset,
    maxSeats: course.maxSeats,
    enrolledCount,
    remainingSeats: Math.max(course.maxSeats - enrolledCount, 0),
    status: course.status,
    room: mapRoom(course.room),
    teacher: mapTeacher(
      course.teacher,
      (course.endHour - course.startHour) // simplified: hours for this course, aggregated at teacher level in the teachers API
    ),
    students: (course.students ?? []).map(mapStudent),
  };
}
