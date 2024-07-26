import bcrypt from 'bcrypt';
import Account from "../models/account.js";
import FlagUser from '../models/flagUser.js';
import Customer from '../models/customer.js';

export const changePassword = async (req, res) => {
    const { account_no, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ 
            code: 400,
            message: 'Passwords does not match',
            data: null 
        });
    }

    try {
        const account = await Account.findOne({ where: { no: account_no } });

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
        return res.status(200).json({ 
            code: 200,
            message: 'New password succes, please verify PIN for teh last step', 
            data: {
                account_no: account.no,
                customer_id: customer.id,
                account_type: account.accountType,
                balance: account.balance,
                customer_data: {
                    username: customer.username,
                    fullname: customer.fullname,
                    email: customer.email,
                    born_date: customer.bornDate,
                },
                flag_user: {
                    is_card_valid: flagUser.is_card_valid,
                    is_birth_valid: flagUser.is_birth_valid,
                    is_email_valid: flagUser.is_email_valid,
                    is_verified: flagUser.is_verified,
                    is_new_password: flagUser.is_new_password,
                    otp_code: flagUser.otp,
                    otp_expired_date: flagUser.otp_expired_date,
                    updated_at: flagUser.updated_at
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
    const { account_no, pin } = req.body;

    try {
        const account = await Account.findOne({ where: { no: account_no } });

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

        if (customer.pin !== pin){
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
                temp_password: null
            },
            { where: { customer_id: account.userId } }
        );
        return res.status(200).json({
            code: 200,
            message: 'Success. Password reset has been completed, please login with your new password!',
            data: {
                account_no: account.no,
                customer_id: customer.id,
                account_type: account.accountType,
                balance: account.balance,
                customer_data: {
                    username: customer.username,
                    fullname: customer.fullname,
                    email: customer.email,
                    born_date: customer.bornDate,
                },
                flag_user: {
                    is_card_valid: flagUser.is_card_valid,
                    is_birth_valid: flagUser.is_birth_valid,
                    is_email_valid: flagUser.is_email_valid,
                    is_verified: flagUser.is_verified,
                    is_new_password: flagUser.is_new_password,
                    otp_code: flagUser.otp,
                    otp_expired_date: flagUser.otp_expired_date,
                    updated_at: flagUser.updated_at
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