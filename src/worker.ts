import { Worker } from 'bullmq';
import { redisConfig } from './configs/redis';
import { processReminderDelivery } from './services/reminderDeliveryService';
import { remindersRepository } from './repositories/remindersRepository';

console.log('🚀 Worker de lembretes iniciado!');

const worker = new Worker(
  'reminders',
  async (job) => {
    const { reminderId } = job.data;
    console.log(`\n⏰ Processando lembrete ID: ${reminderId}`);

    try {
      await processReminderDelivery(reminderId);

      console.log(`✅ Lembrete ${reminderId} processado via Resend.`);
    } catch (error) {
      console.error(`❌ Falha ao processar o lembrete ${reminderId}:`, error);
      await remindersRepository.markAsError(reminderId);
    }
  },
  { connection: redisConfig }
);

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} falhou com o erro: ${err.message}`);
});
