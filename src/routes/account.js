import express from 'express';
import { getAccounts, validateCard, validateBirthDate, validateEmail, verifyOtp } from "../controllers/accountController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CardValidation:
 *       type: object
 *       required:
 *         - atm_card_no
 *         - card_number
 *       properties:
 *         atm_card_no:
 *           type: string
 *           description: The card number to be validated
 *         expMonth:
 *           type: integer
 *           description: The card month expired
 *         expYear:
 *           type: integer
 *           description: The card year expired
 *       example:
 *         atm_card_no: '123456789'
 *         expMonth: 11
 *         expYear: 2025
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BirthDateValidation:
 *       type: object
 *       required:
 *         - atm_card_no
 *         - born_date
 *       properties:
 *         atm_card_no:
 *           type: string
 *           description: The card number to be validated
 *         born_date:
 *           type: string
 *           format: date
 *           description: The birth date to be validated
 *       example:
 *         atm_card_no: '123456789'
 *         born_date: '2002-12-29'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EmailValidation:
 *       type: object
 *       required:
 *         - atm_card_no
 *         - email
 *       properties:
 *         atm_card_no:
 *           type: string
 *           description: The card number to be validated
 *         email:
 *           type: string
 *           format: email
 *           description: The email to be validated
 *       example:
 *         atm_card_no: '123456789'
 *         email: 'user@gmail.com'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OtpVerification:
 *       type: object
 *       required:
 *         - atm_card_no
 *         - otp
 *       properties:
 *         atm_card_no:
 *           type: string
 *           description: The account number of the user
 *         otp:
 *           type: string
 *           description: The OTP to be verified
 *       example:
 *         atm_card_no: '123456789'
 *         otp: '123456'
 */

/**
 * @swagger
 * tags:
 *   name: Reset Password
 */

/**
 * @swagger
 * /v1/reset/password/validation/card:
 *   post:
 *     summary: 
 *     tags: [Reset Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CardValidation'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 */

/**
 * @swagger
 * /v1/reset/password/validation/birthDate:
 *   post:
 *     summary: 
 *     tags: [Reset Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BirthDateValidation'
 *     responses:
 *       200:
 *         description: Birth date validation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *       
 */

/**
 * @swagger
 * /v1/reset/password/validation/email:
 *   post:
 *     summary: 
 *     tags: [Reset Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailValidation'
 *     responses:
 *       200:
 *         description: Email validation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 */

/**
 * @swagger
 * /v1/reset/password/validation/otpVerify:
 *   post:
 *     summary: 
 *     tags: [Reset Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpVerification'
 *     responses:
 *       200:
 *         description: OTP verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 */

router.get('/v1/accounts', getAccounts);
router.post('/v1/reset/password/validation/card', validateCard);
router.post('/v1/reset/password/validation/birthDate', validateBirthDate);
router.post('/v1/reset/password/validation/email', validateEmail);
router.post('/v1/reset/password/validation/otpVerify', verifyOtp);

export default router;