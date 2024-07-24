import express from 'express';
import { getAccounts } from "../controllers/accountController.js"

const router = express.Router();

router.get('/v1/accounts', getAccounts);

export default router;