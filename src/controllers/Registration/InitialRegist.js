import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import Customer from "../../models/Customers.js";
import { sendResponse, sendErrResponse } from '../../helpers/responseHelper.js';
import { sendOTPEmail } from "../../utils/emailUtils.js";
import { generateOTP } from "../../utils/generateOtpUtils.js";
import { formatToJakartaTime } from "../../utils/dateUtils.js";
import { validateEmail, validateUsername, validatePassword } from "../../utils/validationUtils.js";

const validateRegistrationInput = (email, username, password, confirmPassword) => {
    if (!email || !username || !password || !confirmPassword) {
        return 'Data cannot be null';
    }
    if (!validateEmail(email)) {
        return 'Invalid email format';
    }
    if (!validateUsername(username)) {
        return 'Invalid username format. It must be 6 characters and cannot contain only numbers';
    }
    const passwordValidation = validatePassword(password, confirmPassword);
    if (!passwordValidation.valid) {
        return passwordValidation.message;
    }
    return null;
};

const processRegistration = async (existingTempRegist, data, res) => {
    const { email, hashedPassword, otp, otpExpiry, username } = data;

    if (existingTempRegist) {
        await existingTempRegist.update({
            email,
            password: hashedPassword,
            otp_code: otp,
            otp_expired_date: otpExpiry,  
            updated_at: new Date(),
        });
        await sendOTPEmail(email, otp, username);

        const otpExpiredFormatted = formatToJakartaTime(otpExpiry);

        return sendResponse(res, 200, 'Temporary registration updated', true, {
            data_customer: {
                email: existingTempRegist.email,
                username: existingTempRegist.username,
            },
            registration: {
                otp_code: existingTempRegist.otp_code,
                otp_verified: existingTempRegist.otp_verified,
                otp_expired_date: otpExpiredFormatted,
                created_at: existingTempRegist.created_at,
                updated_at: existingTempRegist.updated_at,
            },
        }, true);
    } else {
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

        const otpExpiredFormatted = formatToJakartaTime(otpExpiry);

        return sendResponse(res, 201, 'Temporary registration success created', true, {
            data_customer: {
                email: newRegistration.email,
                username: newRegistration.username,
            },
            registration: {
                otp_code: newRegistration.otp_code,
                otp_verified: newRegistration.otp_verified,
                otp_expired_date: otpExpiredFormatted,
                created_at: newRegistration.created_at,
                updated_at: newRegistration.updated_at,
            },
        }, true);
    }
};

export const initialRegist = async (req, res) => {
    const { email, username, password, confirmPassword } = req.body;

    try {
        const validationError = validateRegistrationInput(email, username, password, confirmPassword);
        if (validationError) {
            return sendResponse(res, 400, validationError, false, null);
        }

        const existingCustomer = await Customer.findOne({ where: { [Op.or]: [{ username }, { email }] } });
        const existingTempRegist = await TemporaryRegistration.findOne({ where: { username } });

        if (existingCustomer) {
            if (existingCustomer.username === username) {
                return sendResponse(res, 400, 'Username is already taken', false, null);
            }
            if (existingCustomer.email === email) {
                return sendResponse(res, 400, 'Email is already taken', false, null);
            }
        }

        const salt = await bcrypt.genSalt(13);
        const hashedPassword = await bcrypt.hash(password, salt);

        // OTP generate
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

        await processRegistration(existingTempRegist, { email, hashedPassword, otp, otpExpiry, username }, res);

    } catch (error) {
        console.error(error);
        return sendErrResponse(res, 500, 'Internal server error', false, { error: error.message });
    }
};
