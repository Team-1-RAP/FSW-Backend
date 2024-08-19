import express from 'express';
import multer from 'multer';
import { registrationAccount, verifyEmail, accountType, personalData, createPin } from '../controllers/RegistCustomerController.js';
import { uploadImg } from '../controllers/RegistrationCustomer/uploadImgController.js';
import { multerErrorHandler } from '../middleware/MulterHandlers.js';

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
  limits: { fileSize: 2 * 1024 * 1024 }
});

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
 * /v1/registration/customer/personalData:
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
 *                 example: "user123"
 *               fullname:
 *                 type: string
 *                 example: "Jude Belingham"
 *               nik:
 *                 type: string
 *                 example: "1234567890123456"
 *               born_date:
 *                 type: string
 *                 format: date
 *                 example: "2001-07-03"
 *               address:
 *                 type: string
 *                 description: Alamat pengguna
 *                 example: "Jl. Jendral Sudirman No. 123"
 *               accountPurpose_id:
 *                 type: integer
 *                 description: ID tujuan akun
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
 *                   example: OK
 *                 data:
 *                   type: object
 *                   description: 
 */

/**
 * @swagger
 * /v1/registration/customer/uploadImg:
 *   post:
 *     tags: [Registration Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the user
 *                 example: "user123"
 *               ktp_document:
 *                 type: string
 *                 format: binary
 *                 description: KTP image file (JPG/JPEG)
 *               photo_document:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo (JPG/JPEG)
 *               signature_document:
 *                 type: string
 *                 format: binary
 *                 description: Signature image file (JPG/JPEG)
 *     responses:
 *       200:
 *         description: Files uploaded success
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
 *                   example: Files uploaded success
 *                 data:
 *                   type: object
 *                   properties:
 *                     ktp_url:
 *                       type: string
 *                       format: uri
 *                       example: "https://res.cloudinary.com/demo/image/upload/v1234567890/ktp/ktp_image.jpg"
 *                     photo_url:
 *                       type: string
 *                       format: uri
 *                       example: "https://res.cloudinary.com/demo/image/upload/v1234567890/photos/profil_image.jpg"
 *                     signature_url:
 *                       type: string
 *                       format: uri
 *                       example: "https://res.cloudinary.com/demo/image/upload/v1234567890/signature/signature_image.jpg"
 */

/**
 * @swagger
 * /v1/registration/customer/createPin/{username}:
 *   post:
 *     tags: [Registration Customer]
 *     summary: 
 *     parameters:
 *       - in: path
 *         name: username
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


router.post('/v1/registration/customer/profile', registrationAccount);
router.post('/v1/registration/customer/verifyEmail', verifyEmail);
router.post('/v1/registration/customer/accountType', accountType);
router.post('/v1/registration/customer/personalData', personalData);
router.post('/v1/registration/customer/uploadImg', upload.fields([
    { name: 'ktp_document', maxCount: 1 },
    { name: 'photo_document', maxCount: 1 },
    { name: 'signature_document', maxCount: 1 }
  ]), multerErrorHandler, uploadImg)
router.post('/v1/registration/customer/createPin/:username', createPin);

export default router;