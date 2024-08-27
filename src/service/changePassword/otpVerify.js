import FlagUser from '../../models/FlagUsers.js';
import Customer from '../../models/Customers.js';
import Account from '../../models/Accounts.js';
import { formatToJakartaTime } from '../../utils/dateUtils.js';
import { handleError } from '../../utils/handleError.js';

const getCustomer = async (userId) => {
    return await Customer.findOne({ where: { id: userId } });
}

const getUserAccount = async (customerId) => {
    return await Account.findOne({ where: { userId: customerId } });
}

const getFlagUser = async (userId) => {
    return await FlagUser.findOne({ where: { customer_id: userId } });
}

const updateFlagUser = async (userId, isVerified) => {
    return await FlagUser.update(
        { 
            is_email_valid: true, 
            is_verified: isVerified,
            updated_at: new Date().toISOString() 
        },
        { where: { customer_id: userId } }
    );
};

export const verifyOtpStep = async (body, userId) => {
    const { otp } = body;

    try {
        if (!otp) {
            return { error: true, status: 400, message: 'OTP code cannot be empty' };
        }

        const customer = await getCustomer(userId);
        if (!customer) { 
            return { error: true, status: 400, message: 'Customer not found' }; 
        }

        const account = await getUserAccount(customer.id);
        if (!account) {
            return { error: true, status: 400, message: 'Account not found' };
        }

        const flagUser = await getFlagUser(userId);
        if (!flagUser || !flagUser.is_email_valid) {
            return { error: true, status: 400, message: 'Email validation not completed or failed' }; 
        }

        const currentDateTime = new Date().toISOString();
        if (flagUser.otp === otp && new Date(flagUser.otp_expired_date) > new Date(currentDateTime)) {
            await updateFlagUser(userId, true);

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
                    step_validation: 3,
                    created_date: account.createdDate
                },
            };
        } else {
            return { error: true, status: 400, message: 'Invalid or expired OTP' }; 
        }
    } catch (error) {
        return handleError(error);
    }
};