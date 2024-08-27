import bcrypt from 'bcrypt';
import Customer from '../models/Customers.js';
import FlagUser from '../models/FlagUsers.js';
import Account from '../models/Accounts.js';
import { formatToJakartaTime } from "../utils/dateUtils.js";
import { generateOTP } from '../utils/generateOtpUtils.js';
import { sendOTPEmail } from '../utils/emailUtils.js';
import { handleError } from '../utils/handleError.js';

const getCustomer = async (userId) => {
    return await Customer.findOne({ where: { id: userId }});
}

const getFlagUser = async (userId) => {
    return await FlagUser.findOne({ where: {customer_id: userId}})
}

const getUserAccount = async (customerId) => {
    return await Account.findOne({ where: { userId: customerId } });
}

export const currentPasswordStep = async (body, userId) => {
    const { current_password } = body;
    
    if (!current_password) return { error: true, status: 400, message: 'Current password needed' };
    
    const customer = await getCustomer(userId);
    if (!customer) return { error: true, status: 404, message: 'Data user not found'}

    try {  
        const match = await bcrypt.compare(current_password, customer.password);
        if (!match) return { error: true, status: 400, message: 'Current password is incorrect' }
        
        const account = await Account.findOne({ where: { userId: customer.id } });
        const updatedDate = new Date();

        const [flagUser, created] = await FlagUser.findOrCreate({
            where: { customer_id: customer.id },
            defaults: {
                is_currentPass_valid: true,
                updated_at: updatedDate,
                account_no: account.no
            }
        });

        if (!created) {
            await flagUser.update({
                is_currentPass_valid: true,
                account_no: account.no,
                updated_at: updatedDate
            });
        }

        const updatedAtFormatted = formatToJakartaTime(flagUser.updated_at);

        return {
            error: false,
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
        };
    } catch (error) {
        return handleError(error);
    }
};

export const validateEmailStep = async (body, userId) => {
    const { email } = body; 

    try {
        if (!email) return { error: true, status: 400, message: 'Email needed' };

        const flagUser = await getFlagUser(userId);
        if (!flagUser || flagUser.is_currentPass_valid !== true) return { error: true, status: 400, message: 'Current password validation not completed or failed' };

        const customer = await Customer.findOne({ where: { id: userId, email: email } });
        if (!customer) return { error: true, status: 400, message: 'Email does not match user data' };

        const account = await getUserAccount(customer.id);
        if (!account) return { error: true, status: 400, message: 'Account not found for the customer' };

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
            { where: { customer_id: userId } }
        );

        const updatedFlagUser = await FlagUser.findOne({ where: { customer_id: userId } });
        
        const { updated_at: updatedFlagUserUpdatedAt, otp_expired_date: otpExpiredDateFlagUser } = updatedFlagUser;
        const updatedAtFormatted = formatToJakartaTime(updatedFlagUserUpdatedAt);
        const otpExpiredFormatted = formatToJakartaTime(otpExpiredDateFlagUser);

        return {
            error: false,
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
        };

    } catch (error) {
        return handleError(error);
    }
};