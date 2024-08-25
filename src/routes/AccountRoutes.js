import express from 'express';
import { getAccountType, getAccountPurposes } from '../controllers/AccountController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Account
 */

/**
 * @swagger
 * /v1/account/type/accountTypes:
 *   get:
 *     tags: [Account]
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

/**
 * @swagger
 * /v1/account/purposes/accountPurposes:
 *   get:
 *     tags: [Account]
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
 *                   example: Get all account purposes success
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
router.get('/v1/account/type/accountTypes', getAccountType);
router.get('/v1/account/purposes/accountPurposes', getAccountPurposes);
export default router;