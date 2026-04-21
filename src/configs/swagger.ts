import swaggerJsdoc, { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Reminder API',
      version: '1.0.0',
      description:
        'API para gestão de lembretes com autenticação JWT, processamento assíncrono e envio de e-mails.',
      contact: {
        name: 'Matheus',
        email: 'matheus@email.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL ?? 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Local',
      },
    ],
    tags: [
      { name: 'Users', description: 'Cadastro de usuários' },
      { name: 'Sessions', description: 'Autenticação e emissão de JWT' },
      { name: 'Reminders', description: 'Gestão de lembretes e agendamentos' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cm123abc0001xyz987654321' },
            name: { type: 'string', example: 'Matheus' },
            email: {
              type: 'string',
              format: 'email',
              example: 'matheus@email.com',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Reminder: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cm123abc0002xyz987654321' },
            message: { type: 'string', example: 'Tomar agua' },
            notificationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Data/hora no formato ISO 8601 em UTC.',
              example: '2026-06-04T03:00:00.000Z',
            },
            userId: { type: 'string', example: 'cm123abc0001xyz987654321' },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criacao em UTC.',
              example: '2026-04-07T00:04:14.911Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualizacao em UTC.',
              example: '2026-04-07T00:04:14.911Z',
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 3 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Erro interno do servidor.' },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Erro de validação.' },
            issues: {
              description: 'Detalhes da validacao retornados pelo Zod.',
              oneOf: [
                {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: true,
                  },
                },
                {
                  type: 'object',
                  additionalProperties: true,
                },
              ],
            },
          },
        },
      },
      responses: {
        BadRequestError: {
          description: 'Requisicao invalida.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationErrorResponse',
              },
              examples: {
                validation: {
                  summary: 'Erro de validacao',
                  value: {
                    message: 'Erro de validação.',
                    issues: [
                      {
                        path: ['notificationDate'],
                        message:
                          'notificationDate deve estar em ISO 8601 com fuso.',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        UnauthorizedError: {
          description: 'Nao autorizado.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              examples: {
                missingToken: {
                  summary: 'Token nao enviado',
                  value: {
                    message: 'Token não fornecido.',
                  },
                },
                invalidCredentials: {
                  summary: 'Credenciais invalidas',
                  value: {
                    message: 'E-mail e/ou senha incorretos',
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Recurso nao encontrado.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              examples: {
                reminderNotFound: {
                  summary: 'Lembrete nao encontrado',
                  value: {
                    message: 'Lembrete não encontrado.',
                  },
                },
              },
            },
          },
        },
        ConflictError: {
          description: 'Conflito de regra de negocio.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              examples: {
                emailInUse: {
                  summary: 'E-mail ja em uso',
                  value: {
                    message: 'Este e-mail já está em uso.',
                  },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'Erro interno do servidor.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              examples: {
                default: {
                  summary: 'Erro interno',
                  value: {
                    message: 'Erro interno do servidor.',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
