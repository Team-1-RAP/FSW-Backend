import express from 'express';
import { registrationAccount, verifyEmail, accountType, createPin } from '../controllers/RegistCustomerController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Registration Customer
 */

/**
 * @swagger
 * /v1/registration/customer/profile:
 *   post:
 *     tags: [Registration Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Alamat email pengguna
 *               username:
 *                 type: string
 *                 description: Nama pengguna
 *               password:
 *                 type: string
 *                 description: Kata sandi pengguna
 *               confirmPassword:
 *                 type: string
 *                 description: Konfirmasi kata sandi
 *             example:
 *               email: "user@gmail.com"
 *               username: "user123"
 *               password: "Password1@"
 *               confirmPassword: "Password1@"
 *     responses:
 *       201:
 *         description: Registration Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   description: 
 *                 message:
 *                   type: string
 *                   description:
 *                 data:
 *                   type: object
 *                   description:
 *               example:
 *                 code: 201
 *                 message: "Registration Created"
 *                 data: {}
 */

/**
 * @swagger
 * /v1/registration/customer/verifyEmail:
 *   post:
 *     tags: [Registration Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: ista12
 *               otp:
 *                 type: string
 *                 example: "123456"
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
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Email verification success
 *                 data:
 *                   type: object
 *                   description: 
 */

/**
 * @swagger
 * /v1/registration/customer/accountType:
 *   post:
 *     tags: [Registration Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: ista12
 *               accountTypeId:
 *                 type: integer
 *                 description: ID of the selected account type
 *                 example: 1
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
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Account type success selected
 *                 data:
 *                   type: object
 *                   properties:
 */

/**
 * @swagger
 * /v1/registration/customer/createPin:
 *   post:
 *     tags: [Registration Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: ista12
 *               pin:
 *                 type: string
 *                 example: "1234"
 *               confirmPin:
 *                 type: string
 *                 example: "1234"
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
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: PIN successfully created and account created
 *                 data:
 *                   type: object
 *                   description: 
 */

router.post('/v1/registration/customer/profile', registrationAccount);
router.post('/v1/registration/customer/verifyEmail', verifyEmail);
router.post('/v1/registration/customer/accountType', accountType);
router.post('/v1/registration/customer/createPin', createPin);

export default router;