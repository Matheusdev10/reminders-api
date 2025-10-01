import express from 'express';
import remindersRoutes from './routes/remindersRoutes';
import usersRoutes from './routes/usersRoutes';
import dotenv from 'dotenv';
import sessionsRoutes from './routes/sessionsRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/reminders', remindersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/sessions', sessionsRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

export default app;
