import Account from "../models/account.js";

export const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.findAll();
        res.json(accounts);
    } catch (err){
        console.error('Error fetching accounts', err);
        res.status(500).json({ error: 'Error fetching accounts' })
    }
};
