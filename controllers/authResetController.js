import bcrypt from 'bcrypt';
import Account from "../models/account.js";
import FlagUser from '../models/flagUser.js';

export const changePassword = async (req, res) => {
    const { account_no, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const account = await Account.findOne({ where: { no: account_no } });

        if (!account) {
            return res.status(400).json({ message: 'Account not found' });
        }

        const flagUser = await FlagUser.findOne({ where: { customer_id: account.userId } });

        if (!flagUser || flagUser.is_verified !== true) {
            return res.status(400).json({ message: 'OTP verification not completed or failed' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await FlagUser.update(
            {
                temp_password: hashedPassword,
                temp_password_salt: salt
            },
            { where: { customer_id: account.userId } }
        );
        return res.status(200).json({ message: 'Please verify PIN for last step', account_no: account.no });
        
    } catch (error) {
        console.error('Error during saving password:', error);
        return res.status(500).json({ error: error.message });
    }
};
