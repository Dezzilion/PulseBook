import { Body, Controller, Delete, Get, Inject, Param, Post } from "@nestjs/common";
import { BookingService } from "./booking.service";

@Controller("bookings")
export class BookingController {
  constructor(
    @Inject(BookingService)
    private readonly bookingService: BookingService
  ) {}

  @Delete(":bookingId")
  async cancelBooking(@Param("bookingId") bookingId: string) {
    return this.bookingService.cancelBooking(bookingId);
  }
  @Post()
  async createBooking(@Body() body: any) {
    return this.bookingService.createBooking({
      userId: body.userId,
      eventId: body.eventId,
      seatsAmount: Number(body.seatsAmount || 1),
    });
  }

  @Get("user/:userId")
  async getUserBookings(@Param("userId") userId: string) {
    return this.bookingService.getBookingsByUser(userId);
  }
}