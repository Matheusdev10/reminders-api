import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { routes } from './routes';
import { AppError } from './errors/AppError';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './configs/swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

// Configuração de CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Permite todas as origens por padrão
  credentials: true, // Permite cookies/autenticação
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (_request: Request, response: Response) => {
  return response.json(swaggerSpec);
});

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
