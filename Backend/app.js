import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connection } from './DB_connect.js';
import { errorHandler } from './middlewares/errorHandler.js';
import userRouter from './routes/userRoutes.js';
import jobRouter1 from './routes/jobRoutes1.js';
import jobRouter2 from './routes/jobRoutes2.js';
import companyRouter from './routes/companyRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import applicationRouter from './routes/applicationRoutes.js';

const app = express();

app.use('/api/v1/review', reviewRouter);

app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true,
  }));


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.use('/api/v1/user', userRouter);

app.use('/api/v1/job', jobRouter1);

app.use('/api/v1/jobs', jobRouter2);

app.use('/api/v1/company', companyRouter);

app.use('/api/v1/application', applicationRouter)
connection();
app.use(errorHandler);

export default app;