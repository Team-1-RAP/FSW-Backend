import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Account from '../../../models/Accounts.js';
import AccountPurpose from '../../../models/AccountPurpose.js';
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

        const account = await Account.findOne({
            where: { no: account_no, userId },
            include: {
                model: AccountPurpose,
                as: 'accountPurpose',
                attributes: ['id', 'type']
            }
        });

        if (!account) {
            return sendErrResponse(res, 404, 'Account not found', false, null);
        }

        await account.update({ pin });

        return sendResponse(res, 200, 'PIN success updated', true, {
            data: {
                user_id: account.userId,
                accountTypeId: account.accountTypeId,
                accountTypeName: account.accountTypeName,
                accountTypeCode: account.code,
                account_no: account.no,
                atm_card_no: account.atm_card_no,
                account_purpose_id: account.accountPurposeId,
                account_purpose: account.accountPurpose ? account.accountPurpose.type : null,
                balance: account.balance,
                pin: account.pin,
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