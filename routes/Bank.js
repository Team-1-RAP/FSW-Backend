import express from 'express';
import { bankTransferValidation } from '../controllers/BankTransferController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BankTransferValidation:
 *       type: object
 *       required:
 *         - user_id
 *         - no_account
 *         - bank_id
 *         - recipient_no_account
 *       properties:
 *         user_id:
 *           type: integer
 *           description: The ID of the user
 *         no_account:
 *           type: string
 *           description: The source account number
 *         bank_id:
 *           type: integer
 *           description: The ID of the destination bank
 *         recipient_no_account:
 *           type: string
 *           description: The recipient account number
 *       example:
 *         user_id: 1
 *         no_account: "1234567890"
 *         bank_id: 2
 *         recipient_no_account: "0987654321"
 */

/**
 * @swagger
 * tags:
 *   name: Bank Validation
 *   description: 
 */

/**
 * @swagger
 * /v1/transfer/validation/bank:
 *   post:
 *     summary: 
 *     tags: [Bank Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BankTransferValidation'
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
 *                   description: Response code
 *                 message:
 *                   type: string
 *                   description: Response message
 *                 data:
 *                   type: object
 *                   description: Additional data
 */

router.post('/v1/transfer/validation/bank', bankTransferValidation);

export default router;
