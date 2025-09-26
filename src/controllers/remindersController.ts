import { Request, Response } from 'express';
import prisma from '../models/prisma';
import { reminderQueue } from '../lib/queue';

interface CreateReminderRequestBody {
  message: string;
  notificationDate: string;
}

export const createReminder = async (req: Request, res: Response) => {
  try {
    const { message, notificationDate } = req.body as CreateReminderRequestBody;

    if (!message || !notificationDate) {
      return res.status(400).json({
        message: 'Mensagem e data/hora de notificação são obrigatórios.',
      });
    }

    const parsedNotificationDate = new Date(notificationDate);
    if (isNaN(parsedNotificationDate.getTime())) {
      return res
        .status(400)
        .json({ message: 'Formato de data/hora de notificação inválido.' });
    }

    const newReminder = await prisma.reminder.create({
      data: {
        message,
        notificationDate: parsedNotificationDate,
        userId: '212',
      },
    });

    const delay = parsedNotificationDate.getTime() - new Date().getTime();
    console.log(`Agendando job com ${delay / 1000}s de atraso.`);
    await reminderQueue.add(
      'send-notification',
      { reminderId: newReminder.id },
      { delay: delay > 0 ? delay : 0 }
    );

    return res.status(201).json(newReminder);
  } catch (error) {
    console.error('Erro ao criar um lembrete:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const getReminders = async (req: Request, res: Response) => {
  try {
    const reminders = await prisma.reminder.findMany();
    return res.status(200).json(reminders);
  } catch (error) {
    console.error('Erro ao buscar lembretes:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.reminder.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Falha ao deletar lembrete:', error);
    return res.status(500).json({ message: 'Erro ao deletar o lembrete.' });
  }
};

export const patchReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message, notificationDate } = req.body as CreateReminderRequestBody;
    const parsedNotificationDate = new Date(notificationDate);

    await prisma.reminder.update({
      data: { message: message, notificationDate: parsedNotificationDate },
      where: { id },
    });
    return res.status(200).json({ message: 'Lembrete atualizado com sucesso' });
  } catch (error) {
    console.error('Falha ao tentar atualizar um lembrete', error);
    return res.status(500).json({ message: 'Erro ao atualizar o lembrete' });
  }
};

export const getReminderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reminder = await prisma.reminder.findUnique({
      where: {
        id,
      },
    });
    if (!reminder) {
      return res.status(404).json({ message: 'Lembrete não encontrado.' });
    }
    return res.status(200).json(reminder);
  } catch (error) {
    console.error('Erro ao buscar um lembrete:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
