import Account from "../models/account.js";
import Customer from "../models/customer.js";
import AccountNonBca from "../models/AccountNonBca.js";
import Bank from "../models/bank.js";

export const bankTransferValidation = async (req, res) => {
    const { user_id, no_account, bank_id, recipient_no_account } = req.body;

    try {
        if (!user_id || !no_account || !bank_id || !recipient_no_account) {
            return res.status(400).json({
                code: 400,
                message: 'User id, no account, bank id, and recipient account number needed',
                data: null
            });
        }

        const customer = await Customer.findOne({ where: { id: user_id } });
        if (!customer) {
            return res.status(404).json({
                code: 404,
                message: 'User not found',
                data: null
            });
        }

        const account = await Account.findOne({ where: { no: no_account, userId: user_id } });
        if (!account) {
            return res.status(404).json({
                code: 404,
                message: 'Account number data not found or does not belong to the user',
                data: null
            });
        }

        const bankDestination = await Bank.findOne({ where: { id: bank_id } });
        if (!bankDestination) {
            return res.status(404).json({
                code: 404,
                message: 'Bank destination not found',
                data: null
            });
        }

        let recipientAccount = null;
        if (bankDestination.id === 1) {
            recipientAccount = await Account.findOne({ 
                where: { 
                    no: recipient_no_account,
                    bankId: bankDestination.id 
                }
            });

            if (!recipientAccount) {
                return res.status(404).json({
                    code: 404,
                    message: 'Recipient account number not registered as BCA user',
                    data: null
                });
            }
        } else {
            recipientAccount = await AccountNonBca.findOne({ where: { no_non_bca: recipient_no_account } });
            if (!recipientAccount) {
                return res.status(404).json({
                    code: 404,
                    message: 'Recipient account number not found',
                    data: null
                });
            }
        }

        return res.status(200).json({
            code: 200,
            message: 'Bank transfer validation success',
            data: {
                user_id: customer.id,
                account_no: account.no,
                bank_id: bankDestination.id,
                recipient_no_account: recipientAccount.no ? recipientAccount.no : recipientAccount.no_non_bca,
                user_account: {
                    no: account.no,
                    balance: account.balance,
                    accountType: account.account_type
                },
                bank_destination: {
                    id: bankDestination.id,
                    name: bankDestination.bankName,
                    adminFee: bankDestination.adminFee
                },
                recipientAccount: {
                    no: recipientAccount.no || recipientAccount.no_non_bca,
                    atmCardNo: recipientAccount.atm_card_no,
                    accountType: recipientAccount.account_type,
                    balance: recipientAccount.balance,
                    bankId: recipientAccount.bank_id
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
