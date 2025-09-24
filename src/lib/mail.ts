// src/lib/mail.ts

import nodemailer from 'nodemailer';
import 'dotenv/config'; // Para carregar as variáveis do .env

const transport = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export default transport;
