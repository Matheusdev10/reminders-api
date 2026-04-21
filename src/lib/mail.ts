import { Resend } from 'resend';

type SendReminderEmailInput = {
  to: string;
  message: string;
  notificationDate: Date;
};

const resendApiKey = process.env.RESEND_API_KEY;
const mailFrom = process.env.MAIL_FROM ?? 'Remindly <onboarding@resend.dev>';
const brandName = 'Remindly';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatNotificationDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
}

export async function sendReminderEmail({
  to,
  message,
  notificationDate,
}: SendReminderEmailInput) {
  if (!resend) {
    throw new Error('RESEND_API_KEY não configurada.');
  }

  const safeMessage = escapeHtml(message);
  const formattedDate = formatNotificationDate(notificationDate);

  await resend.emails.send({
    from: mailFrom,
    to,
    subject: `Seu lembrete: ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`,
    text: `Olá!\n\nEste é um lembrete para: ${message}\n\nAgendado para: ${formattedDate}\n\n${brandName}`,
    html: `
      <div style="background-color:#f4f6f8;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e6e8ec;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px 24px 16px;background:linear-gradient(135deg,#0B3C5D,#116D6E);color:#ffffff;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">${brandName}</p>
              <h1 style="margin:0;font-size:24px;line-height:1.3;">Você tem um lembrete agendado</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">Olá,</p>
              <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">Este é um lembrete automático do seu sistema:</p>
              <div style="padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:16px;">
                <p style="margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Mensagem</p>
                <p style="margin:0;color:#0f172a;font-size:18px;line-height:1.5;font-weight:600;">${safeMessage}</p>
              </div>
              <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;"><strong>Data e horário:</strong> ${formattedDate}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #e6e8ec;background:#f8fafc;">
              <p style="margin:0;color:#64748b;font-size:12px;line-height:1.5;">Este e-mail foi enviado automaticamente. Se você não reconhece este lembrete, revise sua conta.</p>
            </td>
          </tr>
        </table>
      </div>
    `,
  });
}
