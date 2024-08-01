import bcrypt from 'bcrypt';
import Customer from '../models/customer.js';
import FlagUser from '../models/flagUser.js';
import Account from '../models/account.js';
import { formatToJakartaTime } from "../utils/dateUtils.js";
import { sendOTPEmail } from "../utils/emailUtils.js";
import { generateOTP } from "../controllers/accountController.js";

export const currentPassword = async (req, res) => {
    const { current_password } = req.body;
    
    try {
        if (!current_password) {
            return res.status(400).json({
                code: 400,
                message: 'Current password needed',
                data: null,
            });
        } 

        const customer = await Customer.findOne({ where: { id: req.user.userId } });
        if (!customer) {
            return res.status(404).json({
                code: 404,
                message: 'Data user not found',
                status: 'failed',
                data: null
            });
        }

        const match = await bcrypt.compare(current_password, customer.password);
        if (!match) {
            return res.status(401).json({
                code: 401,
                message: 'Current password is incorrect',
                status: 'failed',
                data: null
            });
        }
        
        const account = await Account.findOne({ where: { userId: customer.id } });
        const [flagUser, created] = await FlagUser.findOrCreate({
            where: { customer_id: customer.id },
            defaults: {
                is_currentPass_valid: true,
                updated_at: new Date(),
                account_no: account.no
            }
        });

        if (!created) {
            await flagUser.update({
                is_currentPass_valid: true,
                account_no: account.no
            });
        }

        const updateAtDB = flagUser.updated_at;
        const updatedAtFormatted = formatToJakartaTime(updateAtDB);

        return res.status(200).json({
            code: 200,
            message: 'Current password validation success',
            data: {
                atm_card_no: account.atm_card_no,
                account_no: account.no,
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
                    is_currentPass_valid: flagUser.is_currentPass_valid,
                    is_email_valid: flagUser.is_email_valid,
                    is_verified: flagUser.is_verified,
                    updated_at: updatedAtFormatted
                },
                step_validation: 1,
                created_date: account.createdDate
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            data: null
        });
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
