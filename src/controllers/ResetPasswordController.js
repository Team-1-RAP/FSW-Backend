import bcrypt from 'bcrypt';
import Account from '../models/Accounts.js';
import FlagUser from '../models/FlagUser.js';
import Customer from '../models/Customer.js';
import { Op, Sequelize } from 'sequelize';
import { sendOTPEmail } from "../utils/emailUtils.js";
import { formatToJakartaTime } from "../utils/dateUtils.js";
import { generateOTP } from "../utils/generateOtpUtils.js";

export const validateCard = async (req, res) => {
    const { atm_card_no, expMonth, expYear } = req.body;

    try {
        if(!expMonth || !expYear || !atm_card_no){
            return res.status(400).json({
                code: 400,
                message: 'Expired month, year and card number needed',
                data: null
            });
        }
        
        const account = await Account.findOne({
            where: {
                atm_card_no: atm_card_no,
                [Op.and]: [
                    Sequelize.literal(`EXTRACT(MONTH FROM exp_date) = ${expMonth}`),
                    Sequelize.literal(`EXTRACT(YEAR FROM exp_date) = ${expYear}`)
                ]
            }
        });

        if (account) {
            const [flagUser, created] = await FlagUser.findOrCreate({
                where: { customer_id: account.userId },
                defaults: {
                    is_card_valid: true,
                    updated_at: new Date(),
                    account_no: account.no
                }
            });

            if (!created) {
                await flagUser.update({
                    is_card_valid: true,
                    account_no: account.no
                });
            }

            const updateAtDB = flagUser.updated_at;
            const updatedAtFormatted = formatToJakartaTime(updateAtDB);

            return res.status(200).json({
                code: 200,
                message: 'Card validation success',
                data: {
                    atm_card_no: account.atm_card_no,
                    account_no: account.no,
                    account_type: account.accountType,
                    balance: account.balance,
                    exp_date: account.expDate,
                    flag_user: {
                        is_card_valid: flagUser.is_card_valid,
                        is_birth_valid: flagUser.is_birth_valid,
                        is_email_valid: flagUser.is_email_valid,
                        is_verified: flagUser.is_verified,
                        is_new_password: flagUser.is_new_password,
                        updated_at: updatedAtFormatted
                    },
                    step_validation: 1,
                    created_date: account.createdDate
                }
            });
        } else {
            return res.status(404).json({
                code: 404,
                message: 'Card validation failed',
                status: false,
                data: null
            });
        }
    } catch (error) {
        console.error('Error during card validation:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

export const validateBirthDate = async (req, res) => {
    const { atm_card_no, born_date } = req.body;

    try {
        const account = await Account.findOne({
            where: { atm_card_no: atm_card_no }
        });

        if (!account) {
            return res.status(404).json({
                code: 404,
                message: 'Account not found',
                data: null
            });
        }

        const flagUser = await FlagUser.findOne({
            where: { customer_id: account.userId }
        });

        if (!flagUser || flagUser.is_card_valid !== true) {
            return res.status(400).json({
                code: 400,
                message: 'Card validation not completed or failed',
                data: null
            });
        }

        const customercheck = await Customer.findOne({ where: {id: account.userId }})
        if (customercheck.bornDate !== born_date){
            return res.status(400).json({
                code: 400,
                message: 'Birth date validation failed or does not match with account data',
                data: null
            });
        }

        const bornDate = new Date(born_date);

        const customer = await Customer.findOne({
            where: {
                id: account.userId,
                bornDate: bornDate,
                bornDate: { [Op.not]: null }
            }
        });

        if (customer) {
            await FlagUser.update(
                { is_birth_valid: true, updated_at: new Date() },
                { where: { customer_id: account.userId } }
            );

            const updatedFlagUser = await FlagUser.findOne({
                where: { customer_id: account.userId }
            });

            const updatedFlagUserUpdatedAt = updatedFlagUser.updated_at;
            const updatedAtFormatted = formatToJakartaTime(updatedFlagUserUpdatedAt);

            return res.status(200).json({
                code: 200,
                message: 'Birth date validation success',
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
                        updated_at: updatedAtFormatted
                    },
                },
                step_validation: 2,
                created_date: account.createdDate
            });
        } else {
            await FlagUser.update(
                { is_birth_valid: false, updated_at: new Date() },
                { where: { customer_id: account.userId } }
            );
            return res.status(400).json({
                code: 400,
                message: 'Birth date validation failed',
                data: null
            });
        }
    } catch (error) {
        console.error('Error during birth date validation:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

export const validateEmail = async (req, res) => {
    const { atm_card_no, email } = req.body; 

    try {
        if (!atm_card_no || !email ) { 
            return res.status(404).json({
                code: 404,
                message: 'Card Number, and Email can not empty data',
                status: false,
                data: null
            });
        }

        const account = await Account.findOne({ where: { atm_card_no: atm_card_no } });

        if (!account) {
            return res.status(404).json({
                code: 404,
                message: 'Account not found',
                status: false,
                data: null
            });
        }

        const flagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });

        if (!flagUser || flagUser.is_birth_valid !== true) {
            return res.status(400).json({
                code: 400,
                message: 'Birth date validation not completed or failed',
                status: false,
                data: null
            });
        }

        const customer = await Customer.findOne({ where: { id: account.userId, email: email } });

        if (customer) {
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
                { where: { customer_id: account.userId } }
            );

            const updatedFlagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });
            
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
                        is_card_valid: updatedFlagUser.is_card_valid,
                        is_birth_valid: updatedFlagUser.is_birth_valid,
                        is_email_valid: updatedFlagUser.is_email_valid,
                        is_verified: updatedFlagUser.is_verified,
                        is_new_password: updatedFlagUser.is_new_password,
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
            await FlagUser.update(
                { is_email_valid: false, updated_at: new Date().toISOString() },
                { where: { customer_id: account.userId } }
            );
            return res.status(400).json({
                code: 400,
                message: 'Email validation failed',
                data: null
            });
        }
    } catch (error) {
        console.error('Error during email validation:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            data: null
        });
    }
};

export const verifyOtp = async (req, res) => {
    const { atm_card_no, otp } = req.body;

    try {
        if (!atm_card_no || !otp ) { 
            return res.status(404).json({
                code: 404,
                message: 'Atm card number and OTP code cannot be empty',
                status: false,
                data: null
            });
        }

        const account = await Account.findOne({ where: { atm_card_no: atm_card_no } });

        if (!account) {
            return res.status(400).json({ message: 'Account not found' });
        }

        const flagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });

        if (!flagUser || flagUser.is_email_valid !== true) {
            return res.status(400).json({ message: 'Email validation not completed or failed' });
        }

        const customer = await Customer.findOne({ where: { id: account.userId } });
        const currentDateTime = new Date().toISOString();

        if (flagUser.otp === otp && new Date(flagUser.otp_expired_date) > new Date(currentDateTime)) {
            await FlagUser.update(
                { 
                    is_email_valid: true, 
                    is_verified: true,
                    updated_at: new Date().toISOString() 
                },
                { where: { customer_id: account.userId } }
            );

            const updatedFlagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });

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
                        is_card_valid: updatedFlagUser.is_card_valid,
                        is_birth_valid: updatedFlagUser.is_birth_valid,
                        is_email_valid: updatedFlagUser.is_email_valid,
                        is_verified: updatedFlagUser.is_verified, 
                        is_new_password: updatedFlagUser.is_new_password,
                        updated_at: updatedAtFormatted
                    },
                    otp_code: {
                        otp: updatedFlagUser.otp,
                        otp_expired_date: otpExpiredFormatted
                    }
                },
                stepValidation: 4,
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