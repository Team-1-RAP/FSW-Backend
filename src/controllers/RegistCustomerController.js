import bcrypt from 'bcrypt';
import Customer from "../models/Customers.js";
import { sendOTPEmail } from "../utils/emailUtils.js";
import { generateOTP } from "../utils/generateOtpUtils.js";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_FORMAT = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

const validateEmail = (email) => EMAIL_FORMAT.test(email);

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
    const { email, password, confirmPassword } = req.body;

    try {
        if (!email || !password || !confirmPassword) {
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

        const newCustomer = await Customer.create({
            email,
            password: hashedPassword,
            createdDate: new Date(),  
            updatedDate: new Date(),  
            enabled: true,  
            loginAttempts: 0,  
        });

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); 

        await sendOTPEmail(email, otp, newCustomer.fullname || 'Pengguna SimpleBank');

        return res.status(201).json({
            code: 201,
            message: 'Account successfully created',
            data: newCustomer,
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
