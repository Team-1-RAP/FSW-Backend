import express from 'express';
import { verifyToken } from '../middleware/VerifyToken.js';
import { addAccountType } from '../controllers/Account/AddAccount/AddNewAccount.js';
import { createNewPin } from '../controllers/Account/AddAccount/NewPin.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Account
 */

/**
 * @swagger
 * /v1/account/new/initial:
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

/**
 * @swagger
 * /v1/account/new-pin/{token}:
 *   post:
 *     tags: [Account]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 * 
 *     summary: non auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pin:
 *                 type: string
 *                 example: '654321'
 *               confirmPin:
 *                 type: string
 *                 example: '654321'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 'PIN success updated'
 *                 status:
 *                   type: boolean
 *                   example: true
 */

router.post('/v1/account/new/initial', verifyToken, addAccountType);
router.post('/v1/account/new-pin/:token', createNewPin);

export default router;
