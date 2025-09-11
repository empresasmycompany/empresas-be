import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { QueueName } from 'src/common/enums/job-constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationRepository } from './notification.repository';
import { NotificationFactory } from './notification.factory';
import { EmailNotificationStrategy } from './strategies/email.strategy';
import { SmsNotificationStrategy } from './strategies/sms.strategy';
import { PushNotificationStrategy } from './strategies/push.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forRoot(),
    BullModule.registerQueue({
      name: QueueName.NOTIFICATION_QUEUE,
    }),
    TypeOrmModule.forFeature([NotificationRepository]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationFactory,
    EmailNotificationStrategy,
    SmsNotificationStrategy,
    PushNotificationStrategy,
  ],
  exports: [
    NotificationService,
    NotificationFactory,
    EmailNotificationStrategy,
    SmsNotificationStrategy,
    PushNotificationStrategy,
  ],
})
export class NotificationModule {}
