import bcrypt from 'bcrypt';
import Customer from '../models/customer.js';
import FlagUser from '../models/flagUser.js';
import Account from '../models/account.js';
import { formatToJakartaTime } from "../utils/dateUtils.js";

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
