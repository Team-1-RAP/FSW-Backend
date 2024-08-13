import express from 'express';
import { registrationAccount } from '../controllers/RegistCustomerController.js';

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
 *                   description: Kode status
 *                 message:
 *                   type: string
 *                   description: Pesan hasil registrasi
 *                 data:
 *                   type: object
 *                   description: Data tambahan dari hasil registrasi
 *               example:
 *                 code: 201
 *                 message: "Registration Created"
 *                 data: {}
 */

router.post('/v1/registration/customer/profile', registrationAccount);

export default router;