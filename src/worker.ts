import { Worker } from 'bullmq';
import prisma from './models/prisma';
import mail from './lib/mail'; // <-- Importe o serviço de e-mail

// Mesma configuração de conexão do Redis
const connection = {
  host: 'localhost',
  port: 6379,
};

console.log('🚀 Worker de lembretes iniciado!');

const worker = new Worker(
  'reminders',
  async (job) => {
    // Pega o ID do lembrete dos dados do job
    const { reminderId } = job.data;
    console.log(`\n⏰ Processando lembrete ID: ${reminderId}`);

    try {
      // 1. Busca o lembrete no banco de dados
      const reminder = await prisma.reminder.findUnique({
        where: { id: reminderId },
      });

      if (!reminder || reminder.status !== 'AGENDADO') {
        console.log(
          `Lembrete ${reminderId} não encontrado ou já processado. Ignorando.`
        );
        return;
      }

      console.log(`Enviando e-mail para o lembrete: "${reminder.message}"`);

      await mail.sendMail({
        from: 'Lembretes App <lembretes@app.com>',
        // Para testes, podemos usar um e-mail fixo ou, no futuro, pegar do usuário
        to: 'usuario-teste@email.com',
        subject: `Seu lembrete: ${reminder.message.substring(0, 20)}...`,
        html: `
        <h1>Olá!</h1>
        <p>Este é um lembrete para:</p>
        <h2>${reminder.message}</h2>
        <p>Agendado para: ${reminder.notificationDate.toLocaleString()}</p>
      `,
      });

      console.log('📧 E-mail enviado para o Mailtrap!');
      // --- FIM DA NOVA PARTE ---

      // 3. Atualiza o status do lembrete no banco para "ENVIADO"
      await prisma.reminder.update({
        where: { id: reminderId },
        data: { status: 'ENVIADO' },
      });

      console.log(
        `✅ Lembrete ${reminderId} processado e marcado como ENVIADO.`
      );
    } catch (error) {
      console.error(`❌ Falha ao processar o lembrete ${reminderId}:`, error);
      // Aqui você poderia, por exemplo, mudar o status para 'ERRO'
      await prisma.reminder.update({
        where: { id: reminderId },
        data: { status: 'ERRO' },
      });
    }
  },
  { connection }
);

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} falhou com o erro: ${err.message}`);
});
