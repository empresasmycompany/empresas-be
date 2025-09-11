import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationFactory } from './notification.factory';
import { QueueName } from 'src/common/enums/job-constants';
import { Queue } from 'bull';
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationChannel } from './enums/notification-channel.enum';
import { Notification } from './entities/notification.entity';
import { generatePagination } from 'src/common/util/pagination';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly factory: NotificationFactory,
    @InjectQueue(QueueName.NOTIFICATION_QUEUE)
    private readonly pushQueue: Queue,
    @InjectRepository(NotificationRepository)
    private readonly notificationRepo: NotificationRepository,
  ) {}

  async sendNotification(dto: SendNotificationDto): Promise<void> {
    const notification = this.notificationRepo.create({
      title: dto?.metadata?.title,
      recipient: dto.recipient,
      message: dto.message,
      channel: dto.channel,
      metadata: dto.metadata,
      delivered: false,
    });
    await this.notificationRepo.save(notification);
    if (dto.channel === NotificationChannel.PUSH) {
      const priority = dto.metadata?.priority ?? 5;

      await this.pushQueue.add(
        QueueName.PUSH_QUEUE,
        {
          recipient: dto.recipient,
          message: dto.message,
          metadata: dto.metadata,
          notificationId: notification.id,
        },
        {
          priority,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );
    } else {
      const strategy = this.factory.getStrategy(dto.channel);
      await strategy.send(dto.recipient, dto.message, dto.metadata);

      notification.delivered = true;
      await this.notificationRepo.save(notification);
    }
  }

  async getAllNotifications(
    page?: number,
    perPage?: number,
    search?: string,
    req?: any,
  ) {
    return await this.notificationRepo.getAllNotifications(
      page,
      perPage,
      search,
      req,
    );
  }
}
