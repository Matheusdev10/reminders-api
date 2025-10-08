import { Request, Response } from 'express';
import { compare } from 'bcryptjs';
const { sign } = require('jsonwebtoken');

import prisma from '../models/prisma';
import { auth } from '../configs/auth';

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

    const { secret, expiresIn } = auth.jwt;

    const token = sign(
      {
        // BALDE 1 (payload): Coloque seus DADOS customizados aqui.
        nome: user.name,
        email: user.email,
      },
      secret, // O segredo para assinar
      {
        // BALDE 2 (options): Coloque apenas as REGRAS e configurações aqui.
        subject: user.id,
        expiresIn: expiresIn,
      }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

//pense que a funçao signIn do jsonwebtoken existem 2 baldes
// o primeiro balde é o payload. ELe é usado para adicionar informações customizadas do usuario
// como se fosse dados extras como email, nome, avatar_url
// o segundo balde é para as regras e claims registradas que são campos padronizados pelo
//protocolo jwt e que tem significado universal
//user.id por exemplo é usado no balde2 porque ele não é um dado qualquer
//ele é o identificar principal de quem o token se trata
// portanto ele vai no "balde2"
