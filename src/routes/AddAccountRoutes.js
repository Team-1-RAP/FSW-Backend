import express from 'express';
import { verifyToken } from '../middleware/VerifyToken.js';
import { addAccountType } from '../controllers/Account/AddAccount/AddNewAccount.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Account
 *   description: Add new accounts for registered user
 */

/**
 * @swagger
 * /v1/account/new/account:
 *   post:
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountTypeId:
 *                 type: integer
 *                 example: 1
 *               address:
 *                 type: string
 *                 example: 'Jl. Panglima Sudirman, Surabaya, Jawa Timur'
 *               accountPurposeId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Account success created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: 'Account success created'
 *                 status: 
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 */

router.post('/v1/account/new/account', verifyToken, addAccountType);

export default router;
