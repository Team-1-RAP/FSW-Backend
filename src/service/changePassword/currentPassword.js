import bcrypt from 'bcrypt';
import FlagUser from '../../models/FlagUsers.js';
import Customer from '../../models/Customers.js';
import Account from '../../models/Accounts.js';
import { formatToJakartaTime } from '../../utils/dateUtils.js';
import { handleError } from '../../utils/handleError.js';

const getCustomer = async (userId) => {
    return await Customer.findOne({ where: { id: userId }});
}

const getUserAccount = async (customerId) => {
    return await Account.findOne({ where: { userId: customerId } });
}

const findOrCreateFlagUser = async (customerId, accountNo, updatedDate) => {
    const [flagUser, created] = await FlagUser.findOrCreate({
        where: { customer_id: customerId },
        defaults: {
            is_currentPass_valid: true,
            updated_at: updatedDate,
            account_no: accountNo
        }
    });

    if (!created) {
        await flagUser.update({
            is_currentPass_valid: true,
            account_no: accountNo,
            updated_at: updatedDate
        });
    }

    return flagUser;
};

export const currentPasswordStep = async (body, userId) => {
    const { current_password } = body;
    
    if (!current_password) {
        return { error: true, status: 400, message: 'Current password needed' };
    }
    
    const customer = await getCustomer(userId);
    if (!customer) {
        return { error: true, status: 404, message: 'Data user not found'}
    }

    try {  
        const match = await bcrypt.compare(current_password, customer.password);
        if (!match) {
            return { error: true, status: 400, message: 'Current password is incorrect' }
        }
        
        const account = await getUserAccount(customer.id);
        const updatedDate = new Date();

        const flagUser = await findOrCreateFlagUser(customer.id, account.no, updatedDate);

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