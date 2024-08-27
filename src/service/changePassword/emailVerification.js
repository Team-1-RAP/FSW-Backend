import FlagUser from '../../models/FlagUsers.js';
import Customer from '../../models/Customers.js';
import Account from '../../models/Accounts.js';
import { formatToJakartaTime } from '../../utils/dateUtils.js';
import { handleError } from '../../utils/handleError.js';
import { generateOTP } from '../../utils/generateOtpUtils.js';
import { sendOTPEmail } from '../../utils/emailUtils.js';

const getUserAccount = async (customerId) => {
    return await Account.findOne({ where: { userId: customerId } });
};

const getFlagUser = async (userId) => {
    return await FlagUser.findOne({ where: { customer_id: userId } });
};

const updateFlagUser = async (customerId, otp, otpExpiry) => {
    return await FlagUser.update(
        {
            is_email_valid: true,
            otp: otp,
            otp_expired_date: otpExpiry,
            updated_at: new Date().toISOString()
        },
        { where: { customer_id: customerId } }
    );
};

const sendOtpAndUpdateFlagUser = async (customerId, email, customerFullname) => {
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); 

    await sendOTPEmail(email, otp, customerFullname);
    await updateFlagUser(customerId, otp, otpExpiry);
};

export const validateEmailStep = async (body, userId) => {
    const { email } = body; 

    try {
        if (!email) {
            return { error: true, status: 400, message: 'Email needed' };
        }

        const flagUser = await getFlagUser(userId);
        if (!flagUser || flagUser.is_currentPass_valid !== true){
            return { error: true, status: 400, message: 'Current password validation not completed or failed' };
        }

        const customer = await Customer.findOne({ where: { id: userId, email: email } });
        if (!customer) {
            return { error: true, status: 400, message: 'Email do not match user data' };
        }

        const account = await getUserAccount(customer.id);
        if (!account) {
            return { error: true, status: 400, message: 'Account not found for the customer' };
        }

        await sendOtpAndUpdateFlagUser(customer.id, email, customer.fullname);

        const updatedFlagUser = await getFlagUser(userId);
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
                },
                step_validation: 2,
                created_date: account.createdDate
            },
        };
    } catch (error) {
        return handleError(error);
    }
};