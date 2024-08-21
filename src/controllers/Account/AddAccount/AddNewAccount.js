import { Op } from 'sequelize';
import AccountTypes from '../../../models/AccountTypes.js';
import Customer from '../../../models/Customers.js';
import AccountPurpose from '../../../models/AccountPurpose.js';
import Account from '../../../models/Accounts.js';
import sequelize from '../../../config/config.js';
import { sendResponse, sendErrResponse } from '../../../helpers/responseHelper.js';
import { sendEmailConfirmation, sendCreatePin } from '../../../utils/emailUtils.js';

const BANK_CODE = '01';
const CARD_NUMBER_PREFIX = '51';

const generateNewAccountNumber = async (accountType) => {
    const accountTypeCode = accountType.code; 

    const lastAccount = await Account.findOne({
        where: { no: { [Op.like]: `${BANK_CODE}${accountTypeCode}%` } },
        order: [['no', 'DESC']]
    });

    const serialNumber = lastAccount ? 
        String(parseInt(lastAccount.no.slice(-6)) + 1).padStart(6, '0') : '000001';
        
    return `${BANK_CODE}${accountTypeCode}${serialNumber}`;
};

const generateNewCardNumber = async () => {
    const lastCard = await Account.findOne({
        where: { atm_card_no: { [Op.like]: `${CARD_NUMBER_PREFIX}%` } },
        order: [['atm_card_no', 'DESC']],
    });

    // new card number
    const cardPrefix = lastCard ? 
        String(parseInt(lastCard.atm_card_no.slice(0, 6)) + 1).padStart(6, '0') : `${CARD_NUMBER_PREFIX}0001`;
    const uniqueNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    const cardNumber = `${cardPrefix}${uniqueNumber}`;
    
    const existingCard = await Account.findOne({ where: { atm_card_no: cardNumber } });
    if (existingCard) throw new Error('Generated card number is not unique, please try again');

    return cardNumber;
};

const schedulePinEmail = (email, accountNumber, cardNumber, fullname) => {
    setTimeout(() => {
        sendCreatePin(email, accountNumber, cardNumber, fullname).catch(emailError => {
            console.error('Error sending PIN email:', emailError);
        });
    }, 120000); //2 menit
};

export const addAccountType = async (req, res) => {
    const { accountTypeId, address, accountPurposeId } = req.body;
    const transaction = await sequelize.transaction(); 

    try {
        const existingCustomer = await Customer.findOne({ where: { id: req.user.userId }});
        if (!existingCustomer) {
            return sendResponse(res, 404, 'User not registered', false, null);
        }

        const accountType = await AccountTypes.findOne({ where: { id: accountTypeId } });
        if (!accountType) {
            return sendResponse(res, 404, 'Account type not found', false, null);
        }

        const accountPurpose = await AccountPurpose.findOne({ where: { id: accountPurposeId }});
        if (!accountPurpose) {
            return sendResponse(res, 404, 'Account purpose not found', false, null);
        }

        await existingCustomer.update({
            address: address,
            updatedDate: new Date()
        }, { transaction });

        const accountNumber = await generateNewAccountNumber(accountType);
        const cardNumber = await generateNewCardNumber();
        const expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + 5); 

        const account = await Account.create({
            no: accountNumber,
            userId: req.user.userId,
            accountTypeId: accountTypeId,
            accountTypeName: accountType.type,
            accountPurposeId: accountPurposeId,
            createdDate: new Date(),
            updatedDate: new Date(),
            atm_card_no: cardNumber,
            expDate: expDate,
            pin: 0
        }, { transaction });
        await transaction.commit();

        await sendEmailConfirmation(existingCustomer.email, existingCustomer.fullname);
        schedulePinEmail(existingCustomer.email, account.no, account.atm_card_no, existingCustomer.fullname);

        return sendResponse(res, 201, 'Account success created', true, {
            data: {
                user_id: account.userId,
                account_typeId: account.accountTypeId,
                account_typeName: account.accountTypeName,
                account_no: account.no,
                account_purpose: account.accountPurposeId,
                account_purposeType: accountType.type,
                atm_card_no: account.atm_card_no,
                exp_date: account.expDate,
                balance: account.balance,
                createdDate: account.createdDate
            }
        });
        
    } catch (error) {
        await transaction.rollback(); 
        console.error('Error during creating account:', error);
        return sendErrResponse(res, 500, 'Internal server error', false, { error: error.message });
    }
};