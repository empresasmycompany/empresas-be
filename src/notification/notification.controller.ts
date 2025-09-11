import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationService } from './notification.service';

// @UseGuards(AuthGuard())
@ApiBearerAuth('token')
@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async send(@Body() dto: SendNotificationDto) {
    await this.notificationService.sendNotification(dto);
    return { message: 'Notification sent successfully' };
  }

  @Get()
  async getAllNotifications(
    @Query('page') page: string,
    @Query('perPage') perPage: string,
    @Query('search') search?: string,
    @Req() req?: Request,
  ) {
    return this.notificationService.getAllNotifications(
      +page,
      +perPage,
      search,
      req,
    );
  }
}
