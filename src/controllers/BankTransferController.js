import Account from "../models/account.js";
import Customer from "../models/customer.js";
import Bank from "../models/bank.js";

export const bankTransferValidation = async (req, res) => {
    const { bank_id, recipient_no_account } = req.body;

    try {
        if (!bank_id || !recipient_no_account) {
            return res.status(400).json({
                code: 400,
                message: 'Bank ID and recipient account needed',
                data: null
            });
        }

        const bankDestination = await Bank.findOne({ where: { id: bank_id } });
        if (!bankDestination) {
            return res.status(404).json({
                code: 404,
                message: 'Bank Destination not found',
                data: null
            });
        }

        let recipientAccount;
        if (bank_id === 1) {
            recipientAccount = await Account.findOne({
                where: { no: recipient_no_account },
                include: {
                    model: Customer,
                    as: 'customer',
                    attributes: ['username', 'fullname']
                }
            });
        } else {
            return res.status(400).json({
                code: 400,
                message: 'Use Bank BCA as bank destination for transfer default',
                data: null
            });
        }

        if (!recipientAccount || !recipientAccount.customer) {
            return res.status(404).json({
                code: 404,
                message: 'Recipient account number not found',
                data: null
            });
        }

        const customer = await Customer.findOne({ where: { id: req.user.userId } });
        if (!customer) {
            return res.status(404).json({
                code: 404,
                message: 'Data user not found',
                data: null
            });
        }

        const account = await Account.findOne({ where: { userId: customer.id } });
        if (!account) {
            return res.status(404).json({
                code: 404,
                message: 'User account not found',
                data: null
            });
        }

        return res.status(200).json({
            code: 200,
            message: 'Bank transfer validation success',
            data: {
                user_id: customer.id,
                account_no: account.no,
                bank_id: account.bankId,
                bank_destination: {
                    id: bankDestination.id,
                    name: bankDestination.bankName,
                    adminFee: bankDestination.adminFee
                },
                recipient_account: {
                    id: recipientAccount.userId,
                    username: recipientAccount.customer.username,
                    fullname: recipientAccount.customer.fullname,
                    account_no: recipientAccount.no,
                    atm_card_no: recipientAccount.atm_card_no,
                    account_type: recipientAccount.accountType,
                    balance: recipientAccount.balance,
                    bank_id: recipientAccount.bankId
                }
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