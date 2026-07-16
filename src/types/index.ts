export interface FloorDTO {
  id: string;
  level: number;
  name: string;
  subtitle: string;
  kind: string;
  studentFacing: boolean;
  occupancyPercent: number;
  occupancyTag: "free" | "light" | "busy" | "almost" | "full";
  color: string;
  roomCount: number;
  studentCount: number;
}

export interface RoomDTO {
  id: string;
  name: string;
  floorId: string;
  floorName: string;
  capacity: number;
  equipment: string[];
  status: string;
  presentCount: number;
}

export interface TeacherDTO {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  phone: string;
  email: string;
  subject: string;
  availability: string;
  hoursThisWeek: number;
}

export interface StudentDTO {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  phone: string;
  email: string;
  level: string;
  photoUrl: string | null;
  registeredAt: string;
  attendance: string;
  payment: string;
}

export interface CourseDTO {
  id: string;
  title: string;
  type: string;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  weekOffset: number;
  maxSeats: number;
  enrolledCount: number;
  remainingSeats: number;
  status: string;
  room: RoomDTO;
  teacher: TeacherDTO;
  students: StudentDTO[];
}

export interface DashboardDTO {
  totalStudents: number;
  studentsByFloor: { floorName: string; count: number }[];
  studentsByRoom: { roomName: string; floorName: string; count: number }[];
  roomOccupancy: { roomName: string; floorName: string; percent: number }[];
  floorOccupancy: { floorName: string; percent: number }[];
  coursesInProgress: number;
  freeRooms: number;
  teachersPresent: number;
  seatsRemainingToday: number;
}
