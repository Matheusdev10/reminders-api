import { ReminderStatus } from '@prisma/client';
import prisma from '../models/prisma';

type CreateReminderData = {
  message: string;
  notificationDate: Date;
  userId: string;
};

type ListRemindersFilters = {
  userId: string;
  status?: ReminderStatus;
  skip: number;
  take: number;
};

type UpdateReminderData = {
  message?: string;
  notificationDate?: Date;
};

export const remindersRepository = {
  create(data: CreateReminderData) {
    return prisma.reminder.create({ data });
  },

  list(filters: ListRemindersFilters) {
    return prisma.reminder.findMany({
      where: {
        userId: filters.userId,
        status: filters.status,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: filters.skip,
      take: filters.take,
    });
  },

  countByUser(userId: string, status?: ReminderStatus) {
    return prisma.reminder.count({
      where: {
        userId,
        status,
      },
    });
  },

  findByIdAndUser(id: string, userId: string) {
    return prisma.reminder.findFirst({
      where: {
        id,
        userId,
      },
    });
  },

  deleteByIdAndUser(id: string, userId: string) {
    return prisma.reminder.deleteMany({
      where: {
        id,
        userId,
      },
    });
  },

  updateByIdAndUser(id: string, userId: string, data: UpdateReminderData) {
    return prisma.reminder.updateMany({
      where: {
        id,
        userId,
      },
      data,
    });
  },

  findByIdWithUser(id: string) {
    return prisma.reminder.findUnique({
      where: { id },
      include: { user: true },
    });
  },

  markAsSent(id: string) {
    return prisma.reminder.updateMany({
      where: { id },
      data: { status: 'ENVIADO' },
    });
  },

  markAsError(id: string) {
    return prisma.reminder.updateMany({
      where: { id },
      data: { status: 'ERRO' },
    });
  },
};
