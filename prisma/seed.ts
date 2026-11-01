import { prisma } from "../lib/prisma"; // Sesuaikan jalur relatif ke lib/prisma.ts
import { Role, LogVisibility, LogStatus } from "@prisma/client";

async function main() {
  console.log('Mulai mengisi data dummy...')

  // 1. Bersihkan data lama (opsional)
  await prisma.logComment.deleteMany()
  await prisma.logEntry.deleteMany()
  await prisma.organizationMember.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()

  // 2. Buat User Dummy
  const userAdmin = await prisma.user.create({
    data: {
      email: 'admin@logbook.com',
      name: 'Budi Santoso (Supervisor)',
      password: 'password123', // Pada aplikasi produksi, gunakan bcrypt/argon2 untuk hash password
      role: Role.SUPERVISOR,
    },
  })

  const userMember = await prisma.user.create({
    data: {
      email: 'member@logbook.com',
      name: 'Siti Rahma (Member)',
      password: 'password123',
      role: Role.MEMBER,
    },
  })

  // 3. Buat Organisasi Dummy
  const org = await prisma.organization.create({
    data: {
      name: 'Tim Software Engineering',
      description: 'Divisi Pengembangan Aplikasi Utama',
    },
  })

  // 4. Tambahkan User ke Organisasi
  await prisma.organizationMember.createMany({
    data: [
      { userId: userAdmin.id, organizationId: org.id },
      { userId: userMember.id, organizationId: org.id },
    ],
  })

  // 5. Buat Log Entries Dummy
  // A. Catatan Privat
  const privateLog = await prisma.logEntry.create({
    data: {
      title: 'Belajar Next.js Server Actions',
      content: 'Mencoba memahami penanganan form dan integrasi Prisma di Next.js App Router.',
      category: 'Pembelajaran',
      status: LogStatus.COMPLETED,
      visibility: LogVisibility.PRIVATE,
      duration: 120, // 120 menit
      userId: userMember.id,
    },
  })

  // B. Catatan Publik Organisasi
  const orgLog = await prisma.logEntry.create({
    data: {
      title: 'Slicing UI Halaman Dashboard Logbook',
      content: 'Menyelesaikan komponen tabel logbook dan integrasi Tailwind CSS.',
      category: 'Frontend',
      status: LogStatus.IN_PROGRESS,
      visibility: LogVisibility.ORGANIZATION,
      duration: 240,
      userId: userMember.id,
      organizationId: org.id,
    },
  })

  // 6. Buat Komentar Feedback dari Atasan
  await prisma.logComment.create({
    data: {
      comment: 'Bagus, pastikan tampilannya juga responsif di ukuran layar HP ya!',
      logEntryId: orgLog.id,
      userId: userAdmin.id,
    },
  })

  console.log('Data dummy berhasil dimasukkan!')
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });