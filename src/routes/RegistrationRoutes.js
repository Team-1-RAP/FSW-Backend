import express from 'express';
import multer from 'multer';
import { customerData } from '../controllers/Registration/CustRegist.js';
import { multerErrorHandler } from '../middleware/MulterHandlers.js';
import { initialRegist } from '../controllers/Registration/InitialRegist.js';
import { createPin } from '../controllers/Registration/CreatePin.js';
import { verifyEmail } from '../controllers/Registration/VerifyEmail.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpg|jpeg/;
    const extname = allowedTypes.test(file.mimetype);
    const mimetype = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Format only .jpg and .jpeg'), false);
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

/**
 * @swagger
 * tags:
 *   name: Registration
 */

/**
 * @swagger
 * /v1/registration/customer/account:
 *   post:
 *     tags: [Registration]
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
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
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
 *     tags: [Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: user123
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
 * /v1/registration/customer/profile:
 *   post:
 *     tags:
 *       - Registration
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: newuser123
 *               accountTypeId:
 *                 type: integer
 *                 example: 1
 *               fullname:
 *                 type: string
 *                 example: New User Bank
 *               nik:
 *                 type: string
 *                 example: 3201010101010001
 *               born_date:
 *                 type: string
 *                 format: date
 *                 example: 2001-01-01
 *               address:
 *                 type: string
 *                 example: "Jl. Panglima Sudirman, Surabaya"
 *               accountPurpose_id:
 *                 type: integer
 *                 example: 1
 *               ktp_document:
 *                 type: string
 *                 format: binary
 *               photo_document:
 *                 type: string
 *                 format: binary
 *               signature_document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Success registration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Files uploaded success
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     data_customer:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                         username:
 *                           type: string
 *                         fullname:
 *                           type: string
 *                         nik:
 *                           type: string
 *                         born_date:
 *                           type: string
 *                           format: date
 *                         address:
 *                           type: string
 *                     data_account:
 *                       type: object
 *                       properties:
 *                         account_no:
 *                           type: string
 *                         atm_card_no:
 *                           type: string
 *                         accountTypeId:
 *                           type: integer
 *                         accountTypeCode:
 *                           type: string
 *                         accountTypeName:
 *                           type: string
 *                         account_purpose_id:
 *                           type: integer
 *                         account_purpose:
 *                           type: string
 *                     document:
 *                       type: object
 *                       properties:
 *                         ktp_url:
 *                           type: string
 *                         photo_url:
 *                           type: string
 *                         signature_url:
 *                           type: string
 *                     registration:
 *                       type: object
 *                       properties:
 *                         otp_code:
 *                           type: string
 *                         otp_verified:
 *                           type: boolean
 *                         otp_expired_date:
 *                           type: string
 *                           format: date-time
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                         accessToken:
 *                           type: string
 *                         token_expDate:
 *                           type: string
 *                           format: date-time
 */

/**
 * @swagger
 * /v1/registration/customer/createPin/{token}:
 *   post:
 *     tags: [Registration]
 *     summary: 
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pin:
 *                 type: string
 *                 example: "123456"
 *               confirmPin:
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
 *                   example: OK
 *                 data:
 *                   type: object
 *                   description: 
 */

router.post('/v1/registration/customer/account', initialRegist);
router.post('/v1/registration/customer/verifyEmail', verifyEmail);
router.post('/v1/registration/customer/profile', upload.fields([
  { name: 'ktp_document', maxCount: 1 },
  { name: 'photo_document', maxCount: 1 },
  { name: 'signature_document', maxCount: 1 }
]), multerErrorHandler, customerData);
router.post('/v1/registration/customer/createPin/:token', createPin);

export default router;