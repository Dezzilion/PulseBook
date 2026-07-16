import { PrismaClient } from "../../prisma/client";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const prisma = new PrismaClient({
  adapter,
});

export class EventService {
  async findAll() {
    return prisma.event.findMany({
      orderBy: {
        date: "asc",
      },
    });
  }
  async findOne(id: string) {
  return prisma.event.findUnique({
    where: { id },
  });
}
}