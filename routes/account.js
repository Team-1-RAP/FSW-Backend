import express from 'express';
import { getAccounts, validateCard } from "../controllers/accountController.js"

const router = express.Router();

router.get('/v1/accounts', getAccounts);
router.post('/v1/auth/cardValidation', validateCard);

export default router;