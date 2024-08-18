import express from 'express';
import { validateCard, validateBirthDate, validateEmail, verifyOtp, changePassword, validatePin } from "../controllers/ResetPasswordController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reset Password
 */

/**
 * @swagger
 * /v1/reset/password/validation/card:
 *   post:
 *     tags: [Reset Password]
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
 * /v1/reset/password/validation/birthDate:
 *   post:
 *     tags: [Reset Password]
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
 *         description: Birth date validation successful
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
 * /v1/reset/password/validation/email:
 *   post:
 *     tags: [Reset Password]
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
 *         description: Email validation successful
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
 * /v1/reset/password/validation/otpVerify:
 *   post:
 *     tags: [Reset Password]
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
 *         description: OTP verification successful
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
 * /v1/reset/password/validation/changePassword:
 *   post:
 *     tags: [Reset Password]
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
 *               password:
 *                 type: string
 *                 description: The new password for the user
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmation of the new password
 *             example:
 *               atm_card_no: '123456789'
 *               password: 'password123'
 *               confirmPassword: 'password123'
 *     responses:
 *       200:
 *         description: Password change successful
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
 * /v1/reset/password/validation/pin:
 *   post:
 *     tags: [Reset Password]
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
 *               pin:
 *                 type: string
 *                 description: The PIN of the user
 *             example:
 *               atm_card_no: '123456789'
 *               pin: '123456'
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

router.post('/v1/reset/password/validation/card', validateCard);
router.post('/v1/reset/password/validation/birthDate', validateBirthDate);
router.post('/v1/reset/password/validation/email', validateEmail);
router.post('/v1/reset/password/validation/otpVerify', verifyOtp);
router.post('/v1/reset/password/validation/changePassword', changePassword);
router.post('/v1/reset/password/validation/pin', validatePin);

export default router;