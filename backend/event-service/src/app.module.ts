import { Module } from "@nestjs/common";
import { EventController } from "./event/event.controller";
import { EventService } from "./event/event.service";

@Module({
  controllers: [EventController],
  providers: [EventService],
})
export class AppModule {}