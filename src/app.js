import express from 'express';
import dotenv from 'dotenv';
import createError from 'http-errors';
import config from './config/app.config';
import userRoutes from './routes/users';
import { errorHandler } from './lib/errors';

dotenv.config();

const app = express();
config(app);

if (process.env.NODE_ENV === 'development') {
    app.get('/', (req, res) => res.sendStatus(200));
}
app.use('/api/users', userRoutes);
app.use((req, res, next) => {
    next(createError(404));
});
app.use(errorHandler);

export default app;
