import bcrypt from 'bcrypt';
import TemporaryRegistration from '../models/TemporaryRegistration.js';
import Customer from "../models/Customers.js";
import { sendOTPEmail } from "../utils/emailUtils.js";
import { generateOTP } from "../utils/generateOtpUtils.js";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_FORMAT = /^(?!\d+$)[A-Za-z0-9]{6}$/;
const PASSWORD_FORMAT = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

const validateEmail = (email) => EMAIL_FORMAT.test(email);

const validateUsername = (username) => USERNAME_FORMAT.test(username);

const validatePassword = (password, confirmPassword) => {
    if (password !== confirmPassword) {
        return { valid: false, message: 'Password and confirm password do not match' };
    }
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!PASSWORD_FORMAT.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter, one number, and one special character or symbol' };
    }
    return { valid: true };
};

export const registrationAccount = async (req, res) => {
    const { email, username, password, confirmPassword } = req.body;

    try {
        if (!email || !username || !password || !confirmPassword) {
            return res.status(400).json({
                code: 400,
                message: 'Data cannot be null',
                data: null,
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                code: 400,
                message: 'Invalid email format',
                data: null,
            });
        }

        if (!validateUsername(username)) {
            return res.status(400).json({
                code: 400,
                message: 'Invalid username format. It must be 6 characters and cannot contain only numbers',
                data: null,
            });
        }

        const existingCustomer = await Customer.findOne({ where: { username } });
        const existingTempRegist = await TemporaryRegistration.findOne({ where: { username }})
        if (existingCustomer || existingTempRegist) {
            return res.status(400).json({
                code: 400,
                message: 'Username is already taken',
                data: null,
            });
        }

        const passwordValidation = validatePassword(password, confirmPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                code: 400,
                message: passwordValidation.message,
                data: null,
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); 

        const newRegistration = await TemporaryRegistration.create({
            email,
            username,
            password: hashedPassword,
            otp_code: otp,
            otp_expired_date: otpExpiry,
            created_at: new Date(),
            updated_at: new Date(),
        });

        await sendOTPEmail(email, otp, username);

        return res.status(201).json({
            code: 201,
            message: 'Temporary registration success created',
            data: newRegistration,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            error: error.message || 'An unknown error occurred',
            data: null,
        });
    }
};