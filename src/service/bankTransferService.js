import Account from '../models/Accounts.js';
import Customer from '../models/Customers.js';
import Bank from '../models/Banks.js';

const getBankDestination = async (bank_id) => {
    return await Bank.findOne({ where: { id: bank_id } });
};

const getRecipientAccount = async (bank_id, recipient_no_account) => {
    if (bank_id !== 1) return null;

    return await Account.findOne({
        where: { no: recipient_no_account },
        include: {
            model: Customer,
            as: 'customer',
            attributes: ['username', 'fullname']
        }
    });
};

const getCustomer = async (userId) => {
    return await Customer.findOne({ where: { id: userId } });
};

const getUserAccount = async (customerId) => {
    return await Account.findOne({ where: { userId: customerId } });
};

export const validateBankTransfer = async (body, userId) => {
    const { bank_id, recipient_no_account } = body;

    if (!bank_id || !recipient_no_account) {
        return { error: true, status: 400, message: 'Bank ID and recipient account needed' };
    }

    const bankDestination = await getBankDestination(bank_id);
    if (!bankDestination) return { error: true, status: 404, message: 'Bank Destination not found' };

    const recipientAccount = await getRecipientAccount(bank_id, recipient_no_account);
    if (!recipientAccount) return { error: true, status: 404, message: 'Recipient account number not found' };

    const customer = await getCustomer(userId);
    if (!customer) return { error: true, status: 404, message: 'Data user not found' };

    const account = await getUserAccount(customer.id);
    if (!account) return { error: true, status: 404, message: 'User account not found' };

    return {
        error: false,
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
    };
};
