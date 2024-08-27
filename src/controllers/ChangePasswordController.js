import bcrypt from 'bcrypt';
import Customer from '../models/Customers.js';
import FlagUser from '../models/FlagUsers.js';
import Account from '../models/Accounts.js';
import { formatToJakartaTime } from '../utils/dateUtils.js';
import { validatePassword } from '../utils/validationUtils.js';
import { currentPasswordStep } from '../service/changePassword/currentPassword.js';
import { validateEmailStep } from '../service/changePassword/emailVerification.js';
import { verifyOtpStep } from '../service/changePassword/otpVerify.js';
import { changePasswordStep } from '../service/changePassword/newPassword.js';
import { sendResponse, sendErrResponse } from '../helpers/responseHelper.js';

export const currentPassword = async (req, res) => {
    try {
        const result = await currentPasswordStep(req.body, req.user.userId)

        if (result.error) {
            return sendResponse (res, result.status, result.message, false, null)
        }

        return sendResponse(res, 200, 'Current password validation success', true, result.data);
    } catch(error) {
        console.error('Error:', error);
        return sendErrResponse(res, 500, 'Internal server error', false, { error: error.message });
    }
};

export const validateEmail = async (req, res) => {
    try {
        const result = await validateEmailStep(req.body, req.user.userId)

        if (result.error) {
            return sendResponse (res, result.status, result.message, false, null)
        }

        return sendResponse(res, 200, 'Email validation success, check your email for OTP code', true, result.data);
    } catch(error) {
        console.error('Error:', error);
        return sendErrResponse(res, 500, 'Internal server error', false, { error: error.message });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const result = await verifyOtpStep(req.body, req.user.userId)

        if (result.error) {
            return sendResponse (res, result.status, result.message, false, null)
        }

        return sendResponse(res, 200, 'OTP verification success', true, result.data);
    } catch(error) {
        console.error('Error:', error);
        return sendErrResponse(res, 500, 'Internal server error', false, { error: error.message });
    }
}

export const changePassword = async (req, res) => {
    try {
        const result = await changePasswordStep(req.body, req.user.userId)

        if (result.error) {
            return sendResponse (res, result.status, result.message, false, null)
        }

        return sendResponse(res, 200, 'Success. New password has been completed, please login with your new password!', true, result.data);
    } catch(error) {
        console.error('Error:', error);
        return sendErrResponse(res, 500, 'Internal server error', false, { error: error.message });
    }
}