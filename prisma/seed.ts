import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const FIRST_NAMES = [
  "Yasmine", "Adam", "Sofia", "Rayan", "Lina", "Mehdi", "Nour", "Amine",
  "Salma", "Youssef", "Inès", "Karim", "Zineb", "Ilyas", "Hiba", "Anas",
  "Malak", "Othmane", "Rim", "Bilal",
];
const LAST_NAMES = [
  "El Amrani", "Benali", "Chraibi", "Idrissi", "Fassi", "Bennis", "Tazi",
  "Alaoui", "Sqalli", "Berrada", "Chakir", "Ziani", "Naciri", "Hakimi",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function fullName(i: number) {
  return { firstName: pick(FIRST_NAMES, i), lastName: pick(LAST_NAMES, i * 7 + 3) };
}

async function main() {
  console.log("Nettoyage de la base...");
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.room.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.admin.deleteMany();

  console.log("Création de l'admin...");
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
  await prisma.admin.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@eduflow.academy",
      name: "Administrateur EduFlow",
      passwordHash,
    },
  });

  console.log("Création des étages...");
  const floorsData = [
    { level: -1, name: "Sous-sol", subtitle: "2 salles de formation", kind: "basement", studentFacing: true },
    { level: 0, name: "Rez-de-chaussée", subtitle: "Accueil EduFlow", kind: "reception", studentFacing: false },
    { level: 1, name: "Mezzanine — Direction", subtitle: "Bureaux de direction", kind: "admin", studentFacing: false },
    { level: 2, name: "Mezzanine — Administration", subtitle: "Bureau admin & salle de réunion", kind: "admin", studentFacing: false },
    { level: 3, name: "1er étage", subtitle: "Salle informatique", kind: "classroom", studentFacing: true },
    { level: 4, name: "2ème étage", subtitle: "Enfants en situation de handicap", kind: "accessible", studentFacing: true },
    { level: 5, name: "3ème étage", subtitle: "Cours de langues", kind: "classroom", studentFacing: true },
    { level: 6, name: "4ème étage", subtitle: "Cours de langues", kind: "classroom", studentFacing: true },
  ];

  const floors = [];
  for (const f of floorsData) {
    floors.push(await prisma.floor.create({ data: f }));
  }
  const floorByLevel = (level: number) => floors.find((f) => f.level === level)!;

  console.log("Création des salles...");
  const roomsData: { floorLevel: number; name: string; capacity: number; equipment: string }[] = [
    { floorLevel: -1, name: "Salle B1", capacity: 15, equipment: "Tableau,Chaises,Tables" },
    { floorLevel: -1, name: "Salle B2", capacity: 15, equipment: "Tableau,Chaises,Tables" },
    { floorLevel: 0, name: "Accueil", capacity: 8, equipment: "Canapé,Réception" },
    { floorLevel: 1, name: "Bureau Direction", capacity: 4, equipment: "Bureau,Visioconférence" },
    { floorLevel: 2, name: "Bureau Admin", capacity: 4, equipment: "Bureau,Imprimante" },
    { floorLevel: 2, name: "Salle de réunion", capacity: 8, equipment: "Écran,Visioconférence,Tableau blanc" },
    { floorLevel: 3, name: "Salle Informatique A", capacity: 16, equipment: "PC,Vidéoprojecteur,Tableau interactif" },
    { floorLevel: 3, name: "Salle Informatique B", capacity: 12, equipment: "PC,Vidéoprojecteur" },
    { floorLevel: 4, name: "Salle Accessible", capacity: 12, equipment: "Tapis,Tables rondes,Chaises adaptées" },
    { floorLevel: 5, name: "Salle 3A", capacity: 20, equipment: "Tableau blanc,Tables,Chaises" },
    { floorLevel: 5, name: "Salle 3B", capacity: 18, equipment: "Tableau blanc,Tables,Chaises" },
    { floorLevel: 6, name: "Salle 4A", capacity: 20, equipment: "Tableau blanc,Tables,Chaises" },
    { floorLevel: 6, name: "Salle 4B", capacity: 18, equipment: "Tableau blanc,Tables,Chaises,Vidéoprojecteur" },
  ];

  const rooms = [];
  for (const r of roomsData) {
    rooms.push(
      await prisma.room.create({
        data: {
          floorId: floorByLevel(r.floorLevel).id,
          name: r.name,
          capacity: r.capacity,
          equipment: r.equipment,
          status: "Libre",
        },
      })
    );
  }
  const roomByName = (name: string) => rooms.find((r) => r.name === name)!;

  console.log("Création des professeurs...");
  const teacherSubjects = [
    "Anglais", "Espagnol", "Français", "Informatique", "Intelligence Artificielle",
    "Accompagnement spécialisé", "Arabe", "Bureautique",
  ];
  const teachers = [];
  for (let i = 0; i < 8; i++) {
    const name = fullName(i + 2);
    teachers.push(
      await prisma.teacher.create({
        data: {
          firstName: name.firstName,
          lastName: name.lastName,
          photoUrl: null,
          phone: `06${(10000000 + i * 137931).toString().slice(0, 8)}`,
          email: `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase().replace(/\s/g, "")}@eduflow.academy`,
          subject: pick(teacherSubjects, i),
          availability: i % 2 === 0 ? "Lun-Ven 9h-17h" : "Lun,Mer,Ven 10h-18h",
        },
      })
    );
  }

  console.log("Création des cours...");
  type CourseSeed = {
    title: string;
    type: string;
    roomName: string;
    teacherIdx: number;
    dayOfWeek: number;
    startHour: number;
    endHour: number;
    maxSeats: number;
    enrolled: number;
  };

  const courseSeeds: CourseSeed[] = [
    // Sous-sol
    { title: "Formation Bureautique", type: "Informatique", roomName: "Salle B1", teacherIdx: 7, dayOfWeek: 0, startHour: 9, endHour: 11, maxSeats: 15, enrolled: 4 },
    { title: "Formation Marketing Digital", type: "Formation pro", roomName: "Salle B2", teacherIdx: 3, dayOfWeek: 1, startHour: 14, endHour: 16, maxSeats: 15, enrolled: 15 },
    { title: "Atelier CV & Entretien", type: "Formation pro", roomName: "Salle B1", teacherIdx: 3, dayOfWeek: 2, startHour: 10, endHour: 12, maxSeats: 15, enrolled: 6 },

    // 1er étage - informatique
    { title: "Cours d'IA appliquée", type: "IA", roomName: "Salle Informatique A", teacherIdx: 4, dayOfWeek: 0, startHour: 9, endHour: 11, maxSeats: 16, enrolled: 16 },
    { title: "Programmation Python", type: "Informatique", roomName: "Salle Informatique A", teacherIdx: 3, dayOfWeek: 1, startHour: 14, endHour: 16, maxSeats: 16, enrolled: 12 },
    { title: "Bureautique avancée", type: "Informatique", roomName: "Salle Informatique B", teacherIdx: 7, dayOfWeek: 2, startHour: 9, endHour: 10.5, maxSeats: 12, enrolled: 5 },
    { title: "Initiation IA pour ados", type: "IA", roomName: "Salle Informatique B", teacherIdx: 4, dayOfWeek: 3, startHour: 16, endHour: 17.5, maxSeats: 12, enrolled: 3 },

    // 2ème étage - accessible
    { title: "Atelier créatif adapté", type: "Accompagnement", roomName: "Salle Accessible", teacherIdx: 5, dayOfWeek: 1, startHour: 10, endHour: 11.5, maxSeats: 12, enrolled: 7 },
    { title: "Motricité et jeux", type: "Accompagnement", roomName: "Salle Accessible", teacherIdx: 5, dayOfWeek: 3, startHour: 10, endHour: 11.5, maxSeats: 12, enrolled: 9 },

    // 3ème étage - langues
    { title: "Anglais Intermédiaire", type: "Langues", roomName: "Salle 3A", teacherIdx: 0, dayOfWeek: 0, startHour: 17, endHour: 18.5, maxSeats: 20, enrolled: 20 },
    { title: "Espagnol Débutant", type: "Langues", roomName: "Salle 3B", teacherIdx: 1, dayOfWeek: 1, startHour: 17, endHour: 18.5, maxSeats: 18, enrolled: 10 },
    { title: "Français FLE", type: "Langues", roomName: "Salle 3A", teacherIdx: 2, dayOfWeek: 4, startHour: 9, endHour: 10.5, maxSeats: 20, enrolled: 1 },

    // 4ème étage - langues
    { title: "Cours de Soutien 2BAC", type: "Soutien scolaire", roomName: "Salle 4A", teacherIdx: 2, dayOfWeek: 2, startHour: 16, endHour: 18, maxSeats: 20, enrolled: 19 },
    { title: "Anglais Avancé", type: "Langues", roomName: "Salle 4A", teacherIdx: 0, dayOfWeek: 3, startHour: 18, endHour: 19.5, maxSeats: 20, enrolled: 14 },
    { title: "Arabe Littéraire", type: "Langues", roomName: "Salle 4B", teacherIdx: 6, dayOfWeek: 4, startHour: 14, endHour: 15.5, maxSeats: 18, enrolled: 0 },
  ];

  let studentGlobalIdx = 0;
  for (const c of courseSeeds) {
    const course = await prisma.course.create({
      data: {
        title: c.title,
        type: c.type,
        roomId: roomByName(c.roomName).id,
        teacherId: teachers[c.teacherIdx].id,
        dayOfWeek: c.dayOfWeek,
        startHour: c.startHour,
        endHour: c.endHour,
        maxSeats: c.maxSeats,
        status: c.enrolled >= c.maxSeats ? "Complet" : "Disponible",
      },
    });

    for (let s = 0; s < c.enrolled; s++) {
      studentGlobalIdx++;
      const name = fullName(studentGlobalIdx);
      const attendanceOptions = ["Présent", "Absent", "Retard", "Non renseigné"];
      const paymentOptions = ["À jour", "En attente", "En retard"];
      const student = await prisma.student.create({
        data: {
          firstName: name.firstName,
          lastName: name.lastName,
          age: 8 + (studentGlobalIdx % 30),
          phone: `07${(10000000 + studentGlobalIdx * 91234).toString().slice(0, 8)}`,
          email: `${name.firstName.toLowerCase()}.${studentGlobalIdx}@mail.com`,
          level: pick(["Débutant", "Intermédiaire", "Avancé"], studentGlobalIdx),
        },
      });
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          attendance: pick(attendanceOptions, studentGlobalIdx),
          payment: pick(paymentOptions, studentGlobalIdx * 3),
        },
      });
    }
  }

  console.log("Seed terminé ✔");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
