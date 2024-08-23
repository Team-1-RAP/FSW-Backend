import { Op } from 'sequelize';
import Account from '../models/Accounts.js';
import TemporaryRegistration from '../models/TemporaryRegistration.js';

const BANK_CODE = '01';
const CARD_NUMBER_PREFIX = '51';

export const generateNewAccountNumber = async (accountType) => {
    const accountTypeCode = accountType.code; 

    const lastTempAccount = await TemporaryRegistration.findOne({
        where: { no_account: { [Op.like]: `${BANK_CODE}${accountTypeCode}%` } },
        order: [['no_account', 'DESC']]
    });

    let serialNumber;

    if (lastTempAccount) {
        serialNumber = String(parseInt(lastTempAccount.no_account.slice(-6)) + 1).padStart(6, '0');
    } else {
        const lastAccount = await Account.findOne({
            where: { no: { [Op.like]: `${BANK_CODE}${accountTypeCode}%` } },
            order: [['no', 'DESC']]
        });

        serialNumber = lastAccount ? 
            String(parseInt(lastAccount.no.slice(-6)) + 1).padStart(6, '0') : '000001';
    }

    return `${BANK_CODE}${accountTypeCode}${serialNumber}`;
};

export const generateNewCardNumber = async () => {
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