import express from 'express';
import { getAccounts, validateCard, validateBirthDate } from "../controllers/accountController.js"

const router = express.Router();

router.get('/v1/accounts', getAccounts);
router.post('/v1/auth/cardValidation', validateCard);
router.post('/v1/auth/birthDateValidation', validateBirthDate);

export default router;