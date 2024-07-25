import Account from "../models/account.js";
import FlagUser from '../models/flagUser.js';
import Customer from '../models/customer.js';
import { Op, Sequelize } from 'sequelize';
import { sendOTPEmail } from "../utils/emailUtils.js";

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.findAll();
        res.json(accounts);
    } catch (err){
        console.error('Error fetching accounts', err);
        res.status(500).json({ error: 'Error fetching accounts' })
    }
};

export const validateCard = async (req, res) => {
    const { cardNumber, expMonth, expYear } = req.body;

    try {
        const account = await Account.findOne({
            where: {
                atm_card_no: cardNumber,
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
                    account_no: account.no
                }
            });

            if (!created) {
                await flagUser.update({
                    is_card_valid: true,
                    account_no: account.no
                });
            }
            return res.status(200).json({ message: 'Card validation successful', account_no: account.no, step: 1 });
        } else {
            return res.status(400).json({ message: 'Card validation failed' });
        }
    } catch (error) {
        console.error('Error during card validation:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const validateBirthDate = async (req, res) => {
    const { account_no, born_date } = req.body;

    try {
        const account = await Account.findOne({
            where: { no: account_no }
        });

        if (!account) {
            return res.status(400).json({ message: 'Account not found' });
        }

        const flagUser = await FlagUser.findOne({
            where: { customer_id: account.userId }
        });

        if (!flagUser || flagUser.is_card_valid !== true) {
            return res.status(400).json({ message: 'Card validation not completed or failed' });
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
            return res.status(200).json({ message: 'Birth date validation successful', account_no: account.no, step: 2 });
        } else {
            await FlagUser.update(
                { is_birth_valid: false, updated_at: new Date() },
                { where: { customer_id: account.userId } }
            );
            return res.status(400).json({ message: 'Birth date validation failed' });
        }
    } catch (error) {
        console.error('Error during birth date validation:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const validateEmail = async (req, res) => {
    const { account_no, email } = req.body;

    try {
        const account = await Account.findOne({ where: { no: account_no } });

        if (!account) {
            return res.status(400).json({ message: 'Account not found' });
        }

        const flagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });

        if (!flagUser || flagUser.is_birth_valid !== true) {
            return res.status(400).json({ message: 'Birth date validation not completed or failed' });
        }

        const customer = await Customer.findOne({ where: { id: account.userId, email: email } });

        if (customer) {
            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); 

            await sendOTPEmail(email, otp);

            await FlagUser.update(
                {
                    is_email_valid: true,
                    otp: otp,
                    otp_expired_date: otpExpiry,
                    updated_at: new Date().toISOString() 
                },
                { where: { customer_id: account.userId } }
            );

            return res.status(200).json({
                message: 'Email validation successful. Check your email for OTP code',
                account_no: account.no,
                step: 3
            });

        } else {
            await FlagUser.update(
                { is_email_valid: false, updated_at: new Date().toISOString() },
                { where: { customer_id: account.userId } }
            );
            return res.status(400).json({ message: 'Email validation failed' });
        }
    } catch (error) {
        console.error('Error during email validation:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const verifyOtp = async (req, res) => {
    const { account_no, otp } = req.body;

    try {
        const account = await Account.findOne({ where: { no: account_no } });

        if (!account) {
            return res.status(400).json({ message: 'Account not found' });
        }

        const flagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });

        if (!flagUser) {
            return res.status(400).json({ message: 'User not found' });
        }

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
            return res.status(200).json({ message: 'OTP verification successful' });
        } else {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.status(500).json({ error: error.message });
    }
};
