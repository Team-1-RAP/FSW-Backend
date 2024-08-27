import bcrypt from 'bcrypt';
import FlagUser from '../../models/FlagUsers.js';
import Customer from '../../models/Customers.js';
import Account from '../../models/Accounts.js';
import { formatToJakartaTime } from '../../utils/dateUtils.js';
import { handleError } from '../../utils/handleError.js';
import { validatePassword } from '../../utils/validationUtils.js';

const getCustomer = async (userId) => {
    return await Customer.findOne({ where: { id: userId } });
};

const getUserAccount = async (customerId) => {
    return await Account.findOne({ where: { userId: customerId } });
};

const getFlagUser = async (userId) => {
    return await FlagUser.findOne({ where: { customer_id: userId } });
};

const updateCustomer = async (userId, hashedPassword) => {
    return await Customer.update(
        {
            password: hashedPassword,
            loginAttempts: 0,
            notLocked: true
        },
        { where: { id: userId } }
    );
};

const updateFlagUser = async (userId) => {
    return await FlagUser.update(
        {
            account_no: null,
            is_currentPass_valid: null,
            is_email_valid: null,
            is_verified: null,
            otp: null,
            otp_expired_date: null
        },
        { where: { customer_id: userId } }
    );
};

export const changePasswordStep = async (body, userId) => {
    const { password, confirmPassword } = body;

    if (!password || !confirmPassword) {
        return { error: true, status: 400, message: 'Password and confirm password cannot be null' };
    }

    const passwordValidation = validatePassword(password, confirmPassword);
    if (!passwordValidation.valid) {
        return { error: true, status: 400, message: passwordValidation.message };
    }

    try {
        const customer = await getCustomer(userId);
        if (!customer) {
            return { error: true, status: 404, message: 'Customer not found' };
        }

        const account = await getUserAccount(customer.id);
        if (!account) {
            return { error: true, status: 404, message: 'Account not found' };
        }

        const flagUser = await getFlagUser(userId);
        if (!flagUser || !flagUser.is_verified) {
            return { error: true, status: 400, message: 'OTP verification not completed or failed' };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await updateCustomer(userId, hashedPassword);
        await updateFlagUser(userId);

        const updatedFlagUser = await getFlagUser(userId);
        const { updated_at: updatedFlagUserUpdatedAt } = updatedFlagUser;
        const updatedAtFormatted = formatToJakartaTime(updatedFlagUserUpdatedAt);

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
                    otp_expired_date: null
                },
                step_validation: 4,
                created_date: account.createdDate
            },
        };
    } catch (error) {
        return handleError(error);
    }
};