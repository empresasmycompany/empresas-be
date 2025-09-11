import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { QueueName } from 'src/common/enums/job-constants';
import { PushNotificationStrategy } from '../strategies/push.strategy';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationStatus } from '../entities/notification.entity';

@Processor(QueueName.NOTIFICATION_QUEUE)
export class PushNotificationProcessor {
  private readonly logger = new Logger(PushNotificationProcessor.name);

  constructor(
    private readonly pushStrategy: PushNotificationStrategy,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  @Process(QueueName.PUSH_QUEUE)
  async handleSendPush(job: Job) {
    const { recipient, message, metadata, notificationId } = job.data;

    try {
      await this.pushStrategy.send(recipient, message, metadata);
      await this.notificationRepo.update(notificationId, {
        status: NotificationStatus.SENT,
      } as any);
      this.logger.log(`Push notification sent to ${recipient}`);
    } catch (error) {
      await this.notificationRepo.update(notificationId, {
        status: NotificationStatus.FAILED,
      } as any);
      this.logger.error(`Push notification failed: ${error.message}`);
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.verbose(
      `Processing job ${job.id} of type ${job.name} to ${job.data.recipient}`,
    );
  }

  @OnQueueCompleted()
  async onCompleted(job: Job) {
    this.logger.log(
      `✅ Job ${job.id} (push to ${job.data.recipient}) completed successfully`,
    );
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    this.logger.error(
      `❌ Job ${job.id} (push to ${job.data.recipient}) failed: ${error.message}`,
    );
  }
}
