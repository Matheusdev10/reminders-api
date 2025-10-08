import { Router } from 'express';
import remindersRoutes from './remindersRoutes';
import usersRoutes from './usersRoutes';
import sessionsRoutes from './sessionsRoutes';

export const routes = Router();
routes.use('/api/reminders', remindersRoutes);
routes.use('/api/users', usersRoutes);
routes.use('/api/sessions', sessionsRoutes);
