import bcrypt from 'bcrypt';
import Customer from '../models/Customers.js';
import FlagUser from '../models/FlagUsers.js';
import Account from '../models/Accounts.js';
import { formatToJakartaTime } from '../utils/dateUtils.js';
import { sendOTPEmail } from '../utils/emailUtils.js';
import { generateOTP } from '../utils/generateOtpUtils.js';
import { validatePassword } from '../utils/validationUtils.js';
import { currentPasswordStep } from '../service/changePasswordService.js';
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
    const { email } = req.body; 

    try {
        if (!email) { 
            return res.status(404).json({
                code: 404,
                message: 'Email needed',
                status: false,
                data: null
            });
        }

        const flagUser = await FlagUser.findOne({ where: { customer_id: req.user.userId } });

        if (!flagUser || flagUser.is_currentPass_valid !== true) {
            return res.status(400).json({
                code: 400,
                message: 'Current password validation not completed or failed',
                status: false,
                data: null
            });
        }

        const customer = await Customer.findOne({ where: { id: req.user.userId, email: email } });

        if (!customer) {
            return res.status(400).json({
                code: 400,
                message: 'Email does not match user data',
                status: false,
                data: null
            });
        }

        const account = await Account.findOne({ where: { userId: customer.id } });

        if (!account) {
            return res.status(404).json({
                code: 404,
                message: 'Account not found for the customer',
                status: false,
                data: null
            });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); 

        const name = customer.fullname || 'Pengguna SimpleBank';
        await sendOTPEmail(email, otp, name);

        await FlagUser.update(
            {
                is_email_valid: true,
                otp: otp,
                otp_expired_date: otpExpiry,
                updated_at: new Date().toISOString() 
            },
            { where: { customer_id: req.user.userId } }
        );

        const updatedFlagUser = await FlagUser.findOne({ where: { customer_id: req.user.userId } });
        
        const { updated_at: updatedFlagUserUpdatedAt, otp_expired_date: otpExpiredDateFlagUser } = updatedFlagUser;
        const updatedAtFormatted = formatToJakartaTime(updatedFlagUserUpdatedAt);
        const otpExpiredFormatted = formatToJakartaTime(otpExpiredDateFlagUser);

        return res.status(200).json({
            code: 200,
            message: 'Email validation success, check your email for OTP code',
            data: {
                atm_card_no: account.atm_card_no,
                account_no: account.no,
                customer_id: customer.id,
                account_type: account.accountType,
                balance: account.balance,
                customer_data: {
                    id: customer.id,
                    username: customer.username,
                    fullname: customer.fullname,
                    email: customer.email,
                    born_date: customer.bornDate,
                },
                flag_user: {
                    is_currentPass_valid: updatedFlagUser.is_currentPass_valid,
                    is_email_valid: updatedFlagUser.is_email_valid,
                    is_verified: updatedFlagUser.is_verified,
                    updated_at: updatedAtFormatted
                },
                otp_code: {
                    otp: updatedFlagUser.otp,
                    otp_expired_date: otpExpiredFormatted
                }
            },
            stepValidation: 2,
            created_date: account.createdDate
        });

    } catch (error) {
        console.error('Error email validation:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

export const verifyOtp = async (req, res) => {
    const { otp } = req.body;

    try {
        if (!otp ) { 
            return res.status(404).json({
                code: 404,
                message: 'OTP code cannot be empty',
                status: false,
                data: null
            });
        }

        const account = await Account.findOne({ where: { userId: req.user.userId } });

        if (!account) {
            return res.status(400).json({ message: 'Account not found' });
        }

        const flagUser = await FlagUser.findOne({ where: { customer_id: req.user.userId } });

        if (!flagUser || flagUser.is_email_valid !== true) {
            return res.status(400).json({ message: 'Email validation not completed or failed' });
        }

        const customer = await Customer.findOne({ where: { id: req.user.userId } });
        const currentDateTime = new Date().toISOString();

        if (flagUser.otp === otp && new Date(flagUser.otp_expired_date) > new Date(currentDateTime)) {
            await FlagUser.update(
                { 
                    is_email_valid: true, 
                    is_verified: true,
                    updated_at: new Date().toISOString() 
                },
                { where: { customer_id: req.user.userId } }
            );

            const updatedFlagUser = await FlagUser.findOne({ where: { customer_id: req.user.userId } });

            const { updated_at: updatedFlagUserUpdatedAt, otp_expired_date: otpExpiredDateFlagUser } = updatedFlagUser;
            const updatedAtFormatted = formatToJakartaTime(updatedFlagUserUpdatedAt);
            const otpExpiredFormatted = formatToJakartaTime(otpExpiredDateFlagUser);

            return res.status(200).json({
                code: 200,
                message: 'OTP verification success',
                data: {
                    atm_card_no: account.atm_card_no,
                    account_no: account.no,
                    customer_id: customer.id,
                    account_type: account.accountType,
                    balance: account.balance,
                    customer_data: {
                        id: customer.id,
                        username: customer.username,
                        fullname: customer.fullname,
                        email: customer.email,
                        born_date: customer.bornDate,
                    },
                    flag_user: {
                        is_currentPass_valid: updatedFlagUser.is_currentPass_valid,
                        is_email_valid: updatedFlagUser.is_email_valid,
                        is_verified: updatedFlagUser.is_verified,
                        updated_at: updatedAtFormatted
                    },
                    otp_code: {
                        otp: updatedFlagUser.otp,
                        otp_expired_date: otpExpiredFormatted
                    }
                },
                stepValidation: 3,
                created_date: account.createdDate
            });
        } else {
            return res.status(400).json({
                code: 400,
                message: 'Invalid or expired OTP',
                data: null
            });
        }
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

export const changePassword = async (req, res) => {
    const { password, confirmPassword } = req.body;

    const passwordValidation = validatePassword(password, confirmPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                code: 400,
                message: passwordValidation.message,
                status: false,
                data: null,
            });
        }

    try {
        const account = await Account.findOne({ where: { userId: req.user.userId } });

        if (!account) {
            return res.status(400).json({ 
                code: 400,
                message: 'Account not found',
                data: null 
            });
        }

        const flagUser = await FlagUser.findOne({ where: { customer_id: req.user.userId } });

        if (!flagUser || flagUser.is_verified !== true) {
            return res.status(400).json({
                code: 400,
                message: 'OTP verification not completed or failed',
                data: null 
            });
        }

        const customer = await Customer.findOne({ where: { id: req.user.userId} });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await Customer.update(
            {
                password: hashedPassword,
                loginAttempts: 0,
                notLocked: true
            },
            { where: { id: req.user.userId } } 
        );

        await FlagUser.update(
            {
                account_no: null,
                is_currentPass_valid: null,
                is_email_valid: null,
                is_verified: null,
                otp: null,
                otp_expired_date: null
            },
            { where: { customer_id: req.user.userId } }
        );

        const updatedFlagUser = await FlagUser.findOne({ where: { customer_id: req.user.userId } });
            
        const { updated_at: updatedFlagUserUpdatedAt } = updatedFlagUser;
        const updatedAtFormatted = formatToJakartaTime(updatedFlagUserUpdatedAt);

        return res.status(200).json({ 
            code: 200,
            message: 'Success. New password has been completed, please login with your new password!', 
            data: {
                atm_card_no: account.atm_card_no,
                account_no: account.no,
                customer_id: customer.id,
                account_type: account.accountType,
                balance: account.balance,
                customer_data: {
                    id: customer.id,
                    username: customer.username,
                    fullname: customer.fullname,
                    email: customer.email,
                    born_date: customer.bornDate,
                },
                flag_user: {
                    is_currentPass_valid: updatedFlagUser.is_currentPass_valid,
                    is_email_valid: updatedFlagUser.is_email_valid,
                    is_verified: updatedFlagUser.is_verified,
                    updated_at: updatedAtFormatted
                },
                otp_code: {
                    otp: updatedFlagUser.otp,
                    otp_expired_date: null
                }
            },
            stepValidation: 4,
            created_date: account.createdDate        
        });
    } catch (error) {
        console.error('Error during saving password:', error);
        return res.status(500).json({
            code: 500,
            message: error.message,
            data: null
        });
    }
};