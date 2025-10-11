import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { addReview, getReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', authenticate, addReview);

export default router;
