import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import AccountTypes from '../../../models/AccountTypes.js';
import Customer from '../../../models/Customers.js';
import AccountPurpose from '../../../models/AccountPurpose.js';
import Account from '../../../models/Accounts.js';
import sequelize from '../../../config/config.js';
import { sendResponse, sendErrResponse } from '../../../helpers/responseHelper.js';
import { sendEmailConfirmation, sendCreatePin, sendCreatePinTes } from '../../../utils/emailUtils.js';
import { generateAddAccountNumber, generateNewCardNumber } from '../../../utils/generateAccount.js';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

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

        const accountNumber = await generateAddAccountNumber(accountType);
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

        try {
            await sendEmailConfirmation(existingCustomer.email, existingCustomer.fullname);
            const token = await sendCreatePinTes(existingCustomer.email, account.no, account.atm_card_no, existingCustomer.fullname, req.user.userId);

            return sendResponse(res, 201, 'Account success created', true, {
                data: {
                    user_id: account.userId,
                    account_typeId: account.accountTypeId,
                    account_typeName: account.accountTypeName,
                    account_no: account.no,
                    account_purpose: account.accountPurposeId,
                    account_purposeType: accountPurpose.type,
                    atm_card_no: account.atm_card_no,
                    exp_date: account.expDate,
                    balance: account.balance,
                    createdDate: account.createdDate,
                    accessToken: token,
                    token_expDate: new Date(jwt.verify(token, jwtSecret).exp * 1000).toISOString()
                }
            });
        } catch (error) {
            console.error('Error after commit:', error);
            return sendErrResponse(res, 500, 'Error after commit', false, { error: error.message });
        }
        
    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback(); 
        }
        console.error('Error during creating account:', error);
        return sendErrResponse(res, 500, 'Internal server error', false, { error: error.message });
    }
};