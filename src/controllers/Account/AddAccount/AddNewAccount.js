import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import AccountTypes from '../../../models/AccountTypes.js';
import Customer from '../../../models/Customers.js';
import AccountPurpose from '../../../models/AccountPurpose.js';

import TemporaryRegistration from '../../../models/TemporaryRegistration.js';
import sequelize from '../../../config/config.js';
import { sendResponse, sendErrResponse } from '../../../helpers/responseHelper.js';
import { sendEmailConfirmation, sendCreatePin, sendCreatePinTes } from '../../../utils/emailUtils.js';
import { generateNewAccountNumber, generateNewCardNumber } from '../../../utils/generateAccount.js';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

const schedulePinEmail = (email, accountNumber, cardNumber, fullname) => {
    setTimeout(() => {
        sendCreatePin(email, accountNumber, cardNumber, fullname).catch(emailError => {
            console.error('Error sending PIN email:', emailError);
        });
    }, 120000);
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

        const accountNumber = await generateNewAccountNumber(accountType);
        const cardNumber = await generateNewCardNumber();

        const tempAccount = await TemporaryRegistration.create({
            is_add_account: true,
            username: existingCustomer.username,
            email: existingCustomer.email,
            fullname: existingCustomer.fullname,
            password: existingCustomer.password,
            no_account: accountNumber,
            user_id: req.user.userId,
            account_type_id: accountTypeId,
            purpose_id: accountPurposeId,
            address: address,
            created_at: new Date(),
            updated_at: new Date(),
            atm_card: cardNumber,
        }, { transaction });
        await transaction.commit();

        try {
            await sendEmailConfirmation(existingCustomer.email, existingCustomer.fullname);
            const token = await sendCreatePinTes(existingCustomer.email, tempAccount.no_account, tempAccount.atm_card, existingCustomer.fullname, req.user.userId);

            return sendResponse(res, 201, 'Temporary Account success created', true, {
                data: {
                    user_id: tempAccount.user_id,
                    account_typeId: tempAccount.account_type_id,
                    account_typeName: accountType.type,
                    account_no: tempAccount.no_account,
                    account_purpose: tempAccount.purpose_id,
                    account_purposeType: accountPurpose.type,
                    atm_card_no: tempAccount.atm_card,
                    createdDate: tempAccount.createdDate,
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