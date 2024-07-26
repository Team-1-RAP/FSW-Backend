import express from 'express';
import { changePassword, validatePin } from '../controllers/authResetController.js';

const router = express.Router();

router.post('/v1/auth/validation/change', changePassword);
router.post('/v1/auth/validation/pin', validatePin);


export default router;