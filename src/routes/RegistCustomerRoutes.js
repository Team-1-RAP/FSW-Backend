import express from 'express';
import { registrationAccount } from '../controllers/RegistCustomerController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegistrationCustomer:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - confirmPassword
 *       properties:
 *         email:
 *           type: string
 *           description: 
 *         password:
 *           type: string
 *           description: 
 *         confirmPassword:
 *           type: string
 *           description: 
 *       example:
 *         email: "user@gmail.com"
 *         password: "Password1@"
 *         confirmPassword: "Password1@"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Registration Customer
 *   description: 
 */

/**
 * @swagger
 * /v1/registration/customer/emailValidation:
 *   post:
 *     summary:
 *     tags: [Registration Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationCustomer'
 *     responses:
 *       201:
 *         description: Account successfully created, OTP sent
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
 *                   description: Customer data
 */

router.post('/v1/registration/customer/emailValidation', registrationAccount);

export default router;
