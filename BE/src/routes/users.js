import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { getAllUsers, getUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', authenticate, authorize([1]), getAllUsers);
router.get('/:id', authenticate, authorize([1]), getUser);
router.delete('/:id', authenticate, authorize([1]), deleteUser);

export default router;
