import { Router } from 'express';
import { createUser } from '../controllers/usersController';

const router = Router();

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Cria um novo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Matheus
 *               email:
 *                 type: string
 *                 format: email
 *                 example: matheus@email.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Usuario criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', createUser);

export default router;
