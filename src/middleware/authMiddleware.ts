// Exemplo da estrutura do seu futuro middleware
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import authConfig from '../configs/auth';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Pega o cabeçalho de autorização
  const authHeader = req.headers.authorization;

  // 2. Verifica se o token foi enviado
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const [, token] = authHeader.split(' '); // Separa "Bearer" do token

  try {
    // 3. Valida o token
    const decoded = verify(token, authConfig.jwt.secret);
    if (typeof decoded.sub !== 'string') {
      throw new Error(
        'Token JWT inválido: subject (sub) não encontrado ou em formato incorreto.'
      );
    }

    // O 'sub' é o ID do usuário que colocamos no token
    const { sub } = decoded;

    // 4. Anexa o ID do usuário à requisição para uso posterior

    req.user = { id: sub };

    return next(); // Tudo certo, pode ir para o controller!
  } catch {
    return res.status(401).json({ message: 'Token inválido.' });
  }
}
