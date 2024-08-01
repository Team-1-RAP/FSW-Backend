import express from 'express';
import { currentPassword, validateEmail } from '../controllers/ChangePasswordController.js';
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
 *           description: The current password of the user
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
 *           description: The email address to be validated
 *       example:
 *         email: "user@gmail.com"
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
 *                   description: Response code
 *                 message:
 *                   type: string
 *                   description: Response message
 *                 data:
 *                   type: object
 *                   description: Additional data
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
 *         description: Email validation successful
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

router.post('/v1/change/password/validation/currentPassword', verifyToken, currentPassword);
router.post('/v1/change/password/validation/email', verifyToken, validateEmail);

export default router;