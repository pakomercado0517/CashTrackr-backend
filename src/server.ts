import express from 'express';
import colors from 'colors';
import morgan from 'morgan';
import { db } from './config/db';
import budgetRouter from './router/budgetRouter';
import authRouter from './router/authRouter';

export async function connectDB() {
  try {
    await db.authenticate();
    await db.sync({ alter: true, force: false });
    console.log(colors.blue('Conexión extitosa a la base de datos'));
  } catch (error) {
    console.log(
      colors.red.bold('Falló la conexión a la base de datos...'),
      error
    );
  }
}

connectDB();

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use('/api/budgets', budgetRouter);
app.use('/api/auth', authRouter);

app.use('/', (req, res) => {
  res.send('Todo bien...');
});

export default app;
