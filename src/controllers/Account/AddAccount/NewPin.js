import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sequelize from '../../../config/config.js';
import Account from '../../../models/Accounts.js';
import AccountTypes from '../../../models/AccountTypes.js';
import AccountPurpose from '../../../models/AccountPurpose.js';
import TemporaryRegistration from '../../../models/TemporaryRegistration.js';
import Customer from '../../../models/Customers.js';
import { sendResponse, sendErrResponse } from '../../../helpers/responseHelper.js';
import { validatePin } from '../../../utils/validationUtils.js';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

export const createNewPin = async (req, res) => {
    const { token } = req.params;
    const { pin, confirmPin } = req.body;

    if (!token) {
        return sendErrResponse(res, 400, 'Token is required', false, null);
    }

    const pinValidation = validatePin(pin, confirmPin);
    if (!pinValidation.valid) {
        return sendResponse(res, 400, pinValidation.message, false, null);
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const { userId, account_no } = decoded;

        console.log('decode:', decoded);

        const tempAccount = await TemporaryRegistration.findOne({ where: { no_account: account_no, user_id: userId } });
        if (!tempAccount) {
            return sendErrResponse(res, 404, 'Temporary account not found', false, null);
        }

        const accountType = await AccountTypes.findOne({ where: { id: tempAccount.account_type_id } });
        if (!accountType) {
            return sendErrResponse(res, 404, 'Account type not found', false, null);
        }

        const customerData = await Customer.findOne({ where: { id: tempAccount.user_id } });
        if (!customerData) {
            return sendErrResponse(res, 404, 'User not found', false, null);
        }

        const expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + 5);

        const transaction = await sequelize.transaction();

        await customerData.update({
            address: tempAccount.address,
            updatedDate: new Date()
        }, { transaction });

        const newAccount = await Account.create({
            no: tempAccount.no_account,
            userId: tempAccount.user_id,
            accountTypeId: tempAccount.account_type_id,
            accountTypeName: accountType.type,
            accountPurposeId: tempAccount.purpose_id,
            createdDate: tempAccount.created_at,
            updatedDate: new Date(),
            atm_card_no: tempAccount.atm_card,
            expDate,
            pin,
        }, { transaction });

        await TemporaryRegistration.destroy({ where: { id: tempAccount.id }, transaction });
        await transaction.commit();

        const accountPurpose = await AccountPurpose.findOne({ where: { id: newAccount.accountPurposeId } })

        return sendResponse(res, 200, 'PIN success set, account created', true, {
            data: {
                user_id: newAccount.userId,
                accountTypeId: newAccount.accountTypeId,
                accountTypeName: newAccount.accountTypeName,
                account_no: newAccount.no,
                atm_card_no: newAccount.atm_card_no,
                account_purpose_id: newAccount.accountPurposeId,
                account_purpose: accountPurpose.type,
                balance: newAccount.balance
            }
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return sendErrResponse(res, 401, 'Invalid token', false, null);
        }
        if (error.name === 'TokenExpiredError') {
            return sendErrResponse(res, 401, 'Token expired', false, null);
        }
        console.error('Error creating new PIN:', error);
        return sendErrResponse(res, 500, 'Internal server error', false, { error: error.message });
    }
};