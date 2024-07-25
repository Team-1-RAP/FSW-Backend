import Account from "../models/account.js";
import FlagUser from '../models/flagUser.js';
import { Op, Sequelize } from 'sequelize';

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
