import "dotenv/config";
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

@Injectable()
export class BookingService {
  async createBooking(data: {
    userId: string;
    eventId: string;
    seatNumber?: string;
    seatsAmount: number;
  }) {
    const event = await prisma.event.findUnique({
      where: {
        id: data.eventId,
      },
    });

    if (!event) {
      throw new Error('Подія не знайдена');
    }

    return prisma.booking.create({
      data: {
        userId: data.userId,
        eventId: data.eventId,
        seatNumber: data.seatNumber,
        seatsAmount: data.seatsAmount,
        totalAmount: event.price * data.seatsAmount,
      },
    });
  }

  async cancelBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Бронювання не знайдено");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "cancelled",
    },
  });
  }

async getBookingsByUser(userId: string) {
  return prisma.booking.findMany({
    where: {
      userId,
      status: {
        not: "cancelled",
      },
    },
    include: {
      event: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
}