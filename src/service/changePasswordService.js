import bcrypt from 'bcrypt';
import Customer from '../models/Customers.js';
import FlagUser from '../models/FlagUsers.js';
import Account from '../models/Accounts.js';
import { formatToJakartaTime } from "../utils/dateUtils.js";

const getCustomer = async (userId) => {
    return await Customer.findOne({ where: { id: userId }});
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
        console.error('Error in validateCurrentPassword:', error);
        return {
            error: true,
            status: 500,
            message: 'Internal server error',
        };
    }
};