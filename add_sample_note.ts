import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.note.create({
    data: {
      title: "How DBE OS Platform Works",
      subject: "business",
      author: "Admin",
      content: "## Welcome to DBE OS!\n\nThe DBE OS is a gamified learning platform.\n\n### Core Features\n- **Farm System**: You can grow virtual trees by studying! Focus sessions water your plots.\n- **Tomatoes**: The main currency. Earn tomatoes by completing tasks, quizzes, and focus sessions.\n- **Notes Library**: Read and annotate notes. Notes support beautiful markdown rendering!\n\n> Get started by clicking 'Start Growing' and complete a Pomodoro session to water your crops!",
    }
  });
  console.log("Sample note created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
