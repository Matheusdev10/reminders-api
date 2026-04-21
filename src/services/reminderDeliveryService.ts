import { remindersRepository } from '../repositories/remindersRepository';
import { sendReminderEmail } from '../lib/mail';

export async function processReminderDelivery(reminderId: string) {
  const reminder = await remindersRepository.findByIdWithUser(reminderId);

  if (!reminder || reminder.status !== 'AGENDADO') {
    return;
  }

  await sendReminderEmail({
    to: reminder.user.email,
    message: reminder.message,
    notificationDate: reminder.notificationDate,
  });

  await remindersRepository.markAsSent(reminderId);
}
