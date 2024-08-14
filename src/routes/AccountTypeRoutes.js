import express from 'express';
import { getAccountType } from '../controllers/AccountTypeController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Account Type
 */

/**
 * @swagger
 * /v1/account/account-types:
 *   get:
 *     tags: [Account Type]
 *     description: 
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
 *                   example: Get all account types success
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       type:
 *                         type: string
 *                       code:
 *                         type: string
 */

router.get('/v1/account/account-types', getAccountType);

export default router;