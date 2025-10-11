import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import toursRoutes from './routes/tours.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import reviewRoutes from './routes/reviews.js';
import locationRouter from "./routes/admin/locations.js";
import serviceRouter from "./routes/admin/services.js";
import tourRouter from "./routes/admin/tours.js";
import userRouter from "./routes/admin/users.js";
import { requestLogger } from './middlewares/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(requestLogger);
app.use(errorHandler);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/api/admin/locations", locationRouter);
app.use("/api/admin/services", serviceRouter);
app.use("/api/admin/tours", tourRouter);
app.use("/api/admin/users", userRouter);

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8088;
app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));
