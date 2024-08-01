import express from 'express';
import { currentPassword, validateEmail, verifyOtp, changePassword } from '../controllers/ChangePasswordController.js';
import { verifyToken } from '../middleware/VerifyToken.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CurrentPasswordRequest:
 *       type: object
 *       required:
 *         - current_password
 *       properties:
 *         current_password:
 *           type: string
 *       example:
 *         current_password: "password"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EmailValidationChangeRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *       example:
 *         email: "user@gmail.com"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OtpValidationChangeRequest:
 *       type: object
 *       required:
 *         - otp
 *       properties:
 *         otp:
 *           type: string
 *       example:
 *         otp: "315263"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - password
 *         - confirmPassword
 *       properties:
 *         password:
 *           type: string
 *         confirmPassword:
 *           type: string
 *       example:
 *         password: "passwordtes"
 *         confirmPassword: "passwordtes"
 */

/**
 * @swagger
 * tags:
 *   name: Change Password
 *   description: 
 */

/**
 * @swagger
 * /v1/change/password/validation/currentPassword:
 *   post:
 *     summary: 
 *     tags: [Change Password]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CurrentPasswordRequest'
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
 * /v1/change/password/validation/email:
 *   post:
 *     summary:
 *     tags: [Change Password]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailValidationChangeRequest'
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
 * /v1/change/password/validation/otpVerify:
 *   post:
 *     summary: 
 *     tags: [Change Password]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpValidationChangeRequest'
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
 * /v1/change/password/validation/changePassword:
 *   post:
 *     summary:
 *     tags: [Change Password]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
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

router.post('/v1/change/password/validation/currentPassword', verifyToken, currentPassword);
router.post('/v1/change/password/validation/email', verifyToken, validateEmail);
router.post('/v1/change/password/validation/otpVerify', verifyToken, verifyOtp);
router.post('/v1/change/password/validation/changePassword', verifyToken, changePassword);

export default router;