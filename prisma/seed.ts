// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    // Seeder user
    const user = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: 'admin123', // ⚠️ nanti bisa diganti ke hash!
      },
    });

    console.log('Seeder selesai!');
  // Bisa tambah data lainnya juga
}

main()
  .then(() => {
    console.log("Seeder selesai!");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
