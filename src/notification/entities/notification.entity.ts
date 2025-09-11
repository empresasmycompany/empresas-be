import { Entity, Column } from 'typeorm';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { BaseEntity } from 'src/base.entity';

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

@Entity()
export class Notification extends BaseEntity {
  @Column()
  recipient: string;

  @Column({ nullable: true })
  title: string;

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  delivered: boolean;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;
}
