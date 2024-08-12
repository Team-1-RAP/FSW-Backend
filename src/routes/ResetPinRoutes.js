import express from 'express';
import { changePin } from '../controllers/ResetPinController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reset Pin
 *   description:
 */

/**
 * @swagger
 * /v1/reset/pin/validation/changePin:
 *   post:
 *     tags: [Reset Pin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               atm_card_no:
 *                 type: string
 *                 description: The account number of the user
 *               pin:
 *                 type: string
 *                 description: The new PIN for the user
 *               confirmPin:
 *                 type: string
 *                 description: Confirmation of the new PIN
 *             example:
 *               atm_card_no: '123456789'
 *               pin: '123654'
 *               confirmPin: '123654'
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */

router.post('/v1/reset/pin/validation/changePin', changePin);
export default router;