import express from 'express';
import { changePassword, validatePin } from '../controllers/authResetController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ChangePassword:
 *       type: object
 *       required:
 *         - account_no
 *         - newPassword
 *       properties:
 *         account_no:
 *           type: string
 *           description: The account number of the user
 *         password:
 *           type: string
 *           description: The new password of the user
 *         confirmPassword:
 *           type: string
 *           description: The confirmation new password of the user
 *       example:
 *         account_no: '123456789'
 *         password: 'password123'
 *         confirmPassword: 'password123'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ValidatePin:
 *       type: object
 *       required:
 *         - account_no
 *         - pin
 *       properties:
 *         account_no:
 *           type: string
 *           description: The account number of the user
 *         pin:
 *           type: string
 *           description: The PIN of the user
 *       example:
 *         account_no: '123456789'
 *         pin: '123456'
 */

/**
 * @swagger
 * /v1/reset/password/validation/changePassword:
 *   post:
 *     summary: 
 *     tags: [Reset Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Password change successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /v1/reset/password/validation/pin:
 *   post:
 *     summary: 
 *     tags: [Reset Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidatePin'
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid PIN or other validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/v1/reset/password/validation/changePassword', changePassword);
router.post('/v1/reset/password/validation/pin', validatePin);

export default router;