import { ReminderStatus } from '@prisma/client';
import { reminderQueue } from '../lib/queue';
import { AppError } from '../errors/AppError';
import { remindersRepository } from '../repositories/remindersRepository';

type CreateReminderInput = {
  message: string;
  notificationDate: Date;
  userId: string;
};

type ListRemindersInput = {
  userId: string;
  page: number;
  limit: number;
  status?: ReminderStatus;
};

type PatchReminderInput = {
  id: string;
  userId: string;
  message?: string;
  notificationDate?: Date;
};

type DeleteReminderInput = {
  id: string;
  userId: string;
};

export async function createReminderService({
  message,
  notificationDate,
  userId,
}: CreateReminderInput) {
  const reminder = await remindersRepository.create({
    message,
    notificationDate,
    userId,
  });

  const delay = notificationDate.getTime() - new Date().getTime();

  await reminderQueue.add(
    'send-notification',
    { reminderId: reminder.id },
    { delay: delay > 0 ? delay : 0 }
  );

  return reminder;
}

export async function listRemindersService({
  userId,
  page,
  limit,
  status,
}: ListRemindersInput) {
  const skip = (page - 1) * limit;

  const [reminders, total] = await Promise.all([
    remindersRepository.list({ userId, status, skip, take: limit }),
    remindersRepository.countByUser(userId, status),
  ]);

  return {
    data: reminders,
    meta: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}

export async function deleteReminderService({
  id,
  userId,
}: DeleteReminderInput) {
  const result = await remindersRepository.deleteByIdAndUser(id, userId);

  if (result.count === 0) {
    throw new AppError(
      'Lembrete não encontrado ou você não tem permissão para deletá-lo.',
      404
    );
  }
}

export async function patchReminderService({
  id,
  userId,
  message,
  notificationDate,
}: PatchReminderInput) {
  const result = await remindersRepository.updateByIdAndUser(id, userId, {
    message,
    notificationDate,
  });

  if (result.count === 0) {
    throw new AppError(
      'Lembrete não encontrado ou você não tem permissão para editá-lo.',
      404
    );
  }
}

export async function getReminderByIdService(id: string, userId: string) {
  const reminder = await remindersRepository.findByIdAndUser(id, userId);

  if (!reminder) {
    throw new AppError('Lembrete não encontrado.', 404);
  }

  return reminder;
}
