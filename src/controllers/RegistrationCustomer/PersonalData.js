import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import AccountPurpose from '../../models/AccountPurpose.js';
import AccountTypes from '../../models/AccountTypes.js';
import { formatToJakartaTime } from "../../utils/dateUtils.js";
import { validateNik } from "../../utils/validationUtils.js";
import { sendResponse } from '../../helpers/responseHelper.js';

export const personalData = async (req, res) => {
    const { username, fullname, nik, born_date, address, accountPurpose_id } = req.body;

    try {
        if (!username || !fullname || !nik || !born_date || !address || !accountPurpose_id) {
            return sendResponse(res, 400, 'Data cannot be empty');
        }

        const formattedBornDate = new Date(born_date).toISOString().split('T')[0];
        const existingTempRegist = await TemporaryRegistration.findOne({ where: { username } });

        if (!existingTempRegist) {
            return sendResponse(res, 404, 'Username not found');
        }

        const { step } = existingTempRegist;

        if (step < 3) {
            return sendResponse(res, 400, 'Previous steps not completed');
        }

        if (step > 3) {
            return sendResponse(res, 400, 'Fromulir personal data is already completed');
        }

        const nikValidation = validateNik(nik);
        if (!nikValidation.valid) {
            return sendResponse(res, 400, nikValidation.message);
        }

        const accountPurpose = await AccountPurpose.findOne({ where: { id: accountPurpose_id } });
        if (!accountPurpose) {
            return sendResponse(res, 404, 'Account purpose not found');
        }

        const accountType = await AccountTypes.findOne({ where: { id: existingTempRegist.account_type_id } });
        if (!accountType) {
            return sendResponse(res, 404, 'Account type not found');
        }

        await existingTempRegist.update({
            fullname,
            nik,
            born_date: formattedBornDate,
            address,
            purpose_id: accountPurpose.id,
            step: step + 1,
            updated_at: new Date().toISOString(),
        });

        const otpExpiredFormatted = formatToJakartaTime(existingTempRegist.otp_expired_date);

        return sendResponse(res, 200, 'Formulir profile success updated', {
            data_customer: {
                email: existingTempRegist.email,
                username: existingTempRegist.username,
                fullname: existingTempRegist.fullname,
                nik: existingTempRegist.nik,
                born_date: formattedBornDate,
                address: existingTempRegist.address,
            },
            data_account: {
                accountTypeId: accountType.id,
                accountTypeCode: accountType.code,
                accountTypeName: accountType.type,
                account_purpose_id: accountPurpose.id,
                account_purpose: accountPurpose.type,
            },
            registration: {
                otp_code: existingTempRegist.otp_code,
                otp_verified: existingTempRegist.otp_verified,
                otp_expired_date: otpExpiredFormatted,
                step: existingTempRegist.step,
                created_at: existingTempRegist.created_at,
                updated_at: existingTempRegist.updated_at,
            },
        });

    } catch (error) {
        console.error('Error during personal data submission:', error);
        return sendResponse(res, 500, 'Internal Server Error', null, error.message);
    }
};