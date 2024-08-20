import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import { formatToJakartaTime } from '../../utils/dateUtils.js';
import { sendResponse, sendErrResponse } from '../../helpers/responseHelper.js';
import AccountTypes from '../../models/AccountTypes.js';

export const accountType = async (req, res) => {
    const { username, accountTypeId } = req.body;

    try {
        if (!username || !accountTypeId) {
            return sendResponse(res, 400, 'Username and type of account cannot be null', false, null);
        }

        const existingTempRegist = await TemporaryRegistration.findOne({ where: { username } });

        if (!existingTempRegist) {
            return sendResponse(res, 404, 'Username not found', false, null);
        }

        const { step } = existingTempRegist;

        if (step < 2) {
            return sendResponse(res, 400, 'Previous steps not completed', false, null);
        }

        if (step > 2) {
            return sendResponse(res, 400, 'Account type is already selected', false, null);
        }

        const accountType = await AccountTypes.findOne({ where: { id: accountTypeId } });

        if (!accountType) {
            return sendResponse(res, 404, 'Account type not found', false, null);
        }

        await existingTempRegist.update({
            account_type_id: accountType.id,
            step: step + 1,
            updated_at: new Date().toISOString(),
        });

        const otpExpiredFormatted = formatToJakartaTime(existingTempRegist.otp_expired_date);

        return sendResponse(res, 200, 'Account type success selected', true, {
            data_customer: {
                email: existingTempRegist.email,
                username: existingTempRegist.username,
            },
            data_account: {
                accountTypeId: accountType.id,
                accountTypeCode: accountType.code,
                accountTypeName: accountType.type,
            },
            registration: {
                otp_code: existingTempRegist.otp_code,
                otp_verified: existingTempRegist.otp_verified,
                otp_expired_date: otpExpiredFormatted,
                step: existingTempRegist.step,
                created_at: existingTempRegist.created_at,
                updated_at: existingTempRegist.updated_at,
            },
        }, true);

    } catch (error) {
        console.error('Error during account type selection:', error);
        return sendErrResponse(res, 500, 'Internal server error', false, { error: error.message });
    }
};