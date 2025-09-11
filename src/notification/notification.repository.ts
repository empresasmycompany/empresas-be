import { EntityRepository, FindManyOptions, ILike, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { generatePagination } from 'src/common/util/pagination';
import { InternalServerErrorException } from '@nestjs/common';

@EntityRepository(Notification)
export class NotificationRepository extends Repository<Notification> {
  async getAllNotifications(
    page = 1,
    perPage = 10,
    search?: string,
    req?: any,
  ) {
    try {
      const skip = (page - 1) * perPage;

      const where: FindManyOptions<Notification>['where'] = search
        ? [
            { recipient: ILike(`%${search}%`) },
            { message: ILike(`%${search}%`) },
          ]
        : undefined;

      const [result, total] = await this.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip,
        take: perPage,
      });

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong: NOTIFICATION-ERROR',
      );
    }
  }
}
