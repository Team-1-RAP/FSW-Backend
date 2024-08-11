import express from 'express';
import { changePin } from '../controllers/authPinController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ChangePin:
 *       type: object
 *       required:
 *         - atm_card_no
 *         - newPin
 *       properties:
 *         atm_card_no:
 *           type: string
 *           description: The account number of the user
 *         pin:
 *           type: string
 *           description: The new pin of the user
 *         confirmPin:
 *           type: string
 *           description: The confirmation new pin of the user
 *       example:
 *         atm_card_no: '123456789'
 *         pin: '123654'
 *         confirmPin: '123654'
 */

/**
 * @swagger
 * /v1/reset/pin/validation/changePin:
 *   post:
 *     summary:
 *     tags: [Reset Pin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePin'
 *     responses:
 *       200:
 *         description: Pin change successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 */


router.post('/v1/reset/pin/validation/changePin', changePin);
export default router;
