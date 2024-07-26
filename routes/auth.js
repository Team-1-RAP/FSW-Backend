import express from 'express';
import { changePassword } from '../controllers/authResetController.js';

const router = express.Router();

router.post('/v1/auth/validation/change', changePassword);

export default router;