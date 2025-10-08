import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { routes } from './routes';
import { AppError } from './errors/AppError';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(routes);

app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction
  ) => {
    // Se o erro for uma instância da nossa classe AppError,
    // significa que é um erro "conhecido" da nossa aplicação.
    if (error instanceof AppError) {
      return response.status(error.statusCode).json({
        message: error.message,
      });
    }

    // Se for um erro inesperado (que não criamos), retornamos um erro 500 genérico.
    console.error(error); // É bom logar o erro para depuração
    return response.status(500).json({
      message: 'Erro interno do servidor.',
    });
  }
);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

export default app;
