import bcrypt from 'bcrypt';
import Account from "../models/account.js";
import FlagUser from '../models/flagUser.js';
import Customer from '../models/customer.js';
import { formatToJakartaTime } from '../utils/dateUtils.js';

export const changePassword = async (req, res) => {
    const { atm_card_no, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ 
            code: 400,
            message: 'Passwords does not match',
            data: null 
        });
    }

    try {
        const account = await Account.findOne({ where: { atm_card_no: atm_card_no } });

        if (!account) {
            return res.status(400).json({ 
                code: 400,
                message: 'Account not found',
                data: null 
            });
        }

        const flagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });

        if (!flagUser || flagUser.is_verified !== true) {
            return res.status(400).json({
                code: 400,
                message: 'OTP verification not completed or failed',
                data: null 
            });
        }
        const customer = await Customer.findOne({ where: { id: account.userId} });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await FlagUser.update(
            {
                is_new_password: true,
                temp_password: hashedPassword,
                temp_password_salt: salt
            },
            { where: { customer_id: account.userId } }
        );

        const updatedFlagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });
            
        const { updated_at: updatedFlagUserUpdatedAt, otp_expired_date: otpExpiredDateFlagUser } = updatedFlagUser;
        const updatedAtFormatted = formatToJakartaTime(updatedFlagUserUpdatedAt);
        const otpExpiredFormatted = formatToJakartaTime(otpExpiredDateFlagUser);

        return res.status(200).json({ 
            code: 200,
            message: 'New password succes, please verify PIN for teh last step', 
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
                    is_card_valid: updatedFlagUser.is_card_valid,
                    is_birth_valid: updatedFlagUser.is_birth_valid,
                    is_email_valid: updatedFlagUser.is_email_valid,
                    is_verified: updatedFlagUser.is_verified,
                    is_new_password: updatedFlagUser.is_new_password,
                    temp_password: updatedFlagUser.temp_password,
                    updated_at: updatedAtFormatted
                },
                otp_code: {
                    otp: updatedFlagUser.otp,
                    otp_expired_date: otpExpiredFormatted
                }
            },
            stepValidation: 5,
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

export const validatePin = async (req, res) => {
    const { atm_card_no, pin } = req.body;

    try {
        const account = await Account.findOne({ where: { atm_card_no: atm_card_no } });

        if (!account) {
            return res.status(400).json({ 
                code: 400,
                message: 'Account not found',
                data: null 
            });
        }

        const flagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });

        if (!flagUser || flagUser.is_new_password !== true) {
            return res.status(400).json({ 
                code: 400,
                message: 'The new password entered was not completed or failed',
                data: null 
            });
        }

        const customer = await Customer.findOne({ where: { id: flagUser.customer_id } });

        if (!customer) {
            return res.status(400).json({ 
                code: 400,
                message: 'Customer not found',
                data: null 
            });
        }

        if (account.pin !== pin){
            return res.status(400).json({ 
                code: 400,
                message: 'Invalid PIN',
                data: null 
            });
        }

        await Customer.update(
            { 
                password: flagUser.temp_password,
                loginAttempts: 0,
                notLocked: true
             },
            { where: { id: flagUser.customer_id } }
        );

        await FlagUser.update(
            {
                is_card_valid: null,
                is_birth_valid: null,
                is_email_valid: null,
                is_verified: null,
                is_new_password: null,
                otp: null,
                otp_expired_date: null,
                temp_password: null,
                temp_password_salt: null
            },
            { where: { customer_id: account.userId } }
        );

        const updatedFlagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });
            
        const { updated_at: updatedFlagUserUpdatedAt } = updatedFlagUser;
        const updatedAtFormatted = formatToJakartaTime(updatedFlagUserUpdatedAt);

        return res.status(200).json({
            code: 200,
            message: 'Success. Password reset has been completed, please login with your new password!',
            data: {
                atm_card_no: account.atm_card_no,
                account_no: account.no,
                pin: account.pin,
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
                    is_card_valid: updatedFlagUser.is_card_valid,
                    is_birth_valid: updatedFlagUser.is_birth_valid,
                    is_email_valid: updatedFlagUser.is_email_valid,
                    is_verified: updatedFlagUser.is_verified,
                    is_new_password: updatedFlagUser.is_new_password,
                    temp_password: updatedFlagUser.temp_password,
                    updated_at: updatedAtFormatted
                },
                otp_code: {
                    otp: updatedFlagUser.otp,
                    otp_expired_date: null
                }
            },
            stepValidation: 6,
            created_date: account.createdDate
        });
    } catch (error) {
        console.error('Error during PIN validation and password reset:', error);
        return res.status(500).json({
            code: 500,
            message: error.message,
            data: null
        });
    }
};