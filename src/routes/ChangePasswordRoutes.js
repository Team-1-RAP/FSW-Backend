import express from 'express';
import { currentPassword, validateEmail, verifyOtp, changePassword } from '../controllers/ChangePasswordController.js';
import { verifyToken } from '../middleware/VerifyToken.js';

const router = express.Router();

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
 *     tags: [Change Password]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_password:
 *                 type: string
 *             example:
 *               current_password: "password"
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
 *     tags: [Change Password]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             example:
 *               email: "user@gmail.com"
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
 *     tags: [Change Password]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *             example:
 *               otp: "315263"
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
 *     tags: [Change Password]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *             example:
 *               password: "passwordtes"
 *               confirmPassword: "passwordtes"
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