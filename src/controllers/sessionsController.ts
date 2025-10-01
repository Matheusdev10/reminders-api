import { Request, Response } from 'express';
import { compare } from 'bcryptjs';
const { sign } = require('jsonwebtoken');

import prisma from '../models/prisma';
import authConfig from '../configs/auth';

interface SessionsRequestBody {
  email: string;
  password: string;
}

export const sessionsController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as SessionsRequestBody;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        message: 'E-mail e/ou senha incorretos',
      });
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      return res.status(401).json({
        message: 'E-mail e/ou senha incorretos',
      });
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
