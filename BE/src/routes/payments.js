import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { createPayment, getPayments } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', authenticate, getPayments);
router.post('/', authenticate, createPayment);

export default router;
