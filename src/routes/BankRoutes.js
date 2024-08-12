import express from 'express';
import { bankTransferValidation } from '../controllers/BankTransferController.js';
import { verifyToken } from '../middleware/VerifyToken.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BankTransferValidation:
 *       type: object
 *       required:
 *         - bank_id
 *         - recipient_no_account
 *       properties:
 *         bank_id:
 *           type: integer
 *           description: The ID of the destination bank
 *         recipient_no_account:
 *           type: string
 *           description: The recipient account number
 *       example:
 *         bank_id: 1
 *         recipient_no_account: "3538914993402"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BankTransferValidation'
 *     responses:
 *       200:
 *         description: OK
 */

router.post('/v1/transfer/validation/bank', verifyToken, bankTransferValidation);

export default router;