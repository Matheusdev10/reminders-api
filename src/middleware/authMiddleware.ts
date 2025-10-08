// Exemplo da estrutura do seu futuro middleware
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { auth } from '../configs/auth';

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
    const decoded = verify(token, auth.jwt.secret);
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

// entendendo como o metodo verify funciona
// sign() (no login): Foi o momento em que você escreveu a carta (payload com o ID do usuário)
// e usou seu selo de cera único e secreto (secret) para criar um lacre (uma assinatura)
//  no envelope. O token final é composto por [cabeçalho].[payload].[assinatura].
// verify() (aqui no middleware): É o momento em que o segurança (middleware) recebe a carta
// (o token). Ele não compara a carta inteira com o seu selo. Ele faz o seguinte:
// Ele lê o payload que veio no token.
// Ele pega o seu próprio secret que está guardado a sete chaves no .env.
// Ele recalcula a assinatura usando o payload do token e o seu secret.
// Ele compara a assinatura que ele acabou de criar com a assinatura que veio no token.
// Se as duas assinaturas baterem, ele tem certeza absoluta de duas coisas:
// O token foi criado usando o seu secret, ou seja, ele é autêntico.
// O payload não foi alterado no meio do caminho, ou seja, ele é íntegro.
// Se as assinaturas não baterem (ou se o token já expirou, pois o verify também checa isso),
// ele joga um erro, que é capturado pelo catch.
// decoded é o resultado se tudo der certo: o payload decodificado.
