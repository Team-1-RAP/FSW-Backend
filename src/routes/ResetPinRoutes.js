import express from "express";
import { changePin } from "../controllers/ResetPinController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
  validateCard,
  validateBirthDate,
  validateEmail,
  verifyOtp,
} from "../controllers/ResetPasswordController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reset Pin
 *   description:
 */

/**
 * @swagger
 * /v1/reset/pin/validation/card:
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
 *                 description: The card number to be validated
 *               expMonth:
 *                 type: integer
 *                 description: The card expiration month
 *               expYear:
 *                 type: integer
 *                 description: The card expiration year
 *             example:
 *               atm_card_no: '123456789'
 *               expMonth: 11
 *               expYear: 2025
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

/**
 * @swagger
 * /v1/reset/pin/validation/birthDate:
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
 *                 description: The card number to be validated
 *               born_date:
 *                 type: string
 *                 format: date
 *                 description: The birth date to be validated
 *             example:
 *               atm_card_no: '123456789'
 *               born_date: '2002-12-29'
 *     responses:
 *       200:
 *         description: Birth date validation success
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

/**
 * @swagger
 * /v1/reset/pin/validation/email:
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
 *                 description: The card number to be validated
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email to be validated
 *             example:
 *               atm_card_no: '123456789'
 *               email: 'user@gmail.com'
 *     responses:
 *       200:
 *         description: Email validation success
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

/**
 * @swagger
 * /v1/reset/pin/validation/otpVerify:
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
 *                 description: The card number to be validated
 *               otp:
 *                 type: string
 *                 description: The OTP to be verified
 *             example:
 *               atm_card_no: '123456789'
 *               otp: '123456'
 *     responses:
 *       200:
 *         description: OTP verification success
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

router.post('/v1/reset/pin/validation/card', verifyToken, validateCard);
router.post('/v1/reset/pin/validation/birthDate', verifyToken, validateBirthDate);
router.post('/v1/reset/pin/validation/email', verifyToken, validateEmail);
router.post('/v1/reset/pin/validation/otpVerify', verifyToken, verifyOtp);
router.post('/v1/reset/pin/validation/changePin', verifyToken, changePin);
export default router;
