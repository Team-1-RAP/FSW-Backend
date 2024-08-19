import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import { formatToJakartaTime } from "../../utils/dateUtils.js"
import AccountTypes from '../../models/AccountTypes.js';

export const accountType = async (req, res) => {
    const { username, accountTypeId } = req.body;

    try {
        if (!username || !accountTypeId) {
            return res.status(400).json({
                code: 400,
                message: 'Username and type of account cannot be empty',
                status: false,
                data: null,
            });
        }

        const existingTempRegist = await TemporaryRegistration.findOne({ where: { username } });

        if (!existingTempRegist) {
            return res.status(404).json({
                code: 404,
                message: 'Username not found',
                status: false,
                data: null,
            });
        }

        const { step } = existingTempRegist;

        if (step < 2) {
            return res.status(400).json({
                code: 400,
                message: 'Previous steps not completed',
                status: false,
                data: null,
            });
        }

        if (step > 2) {
            return res.status(400).json({
                code: 400,
                message: 'Account type is already selected',
                status: false,
                data: null,
            });
        }

        const accountType = await AccountTypes.findOne({ where: { id: accountTypeId } });
        
        if (!accountType) {
            return res.status(404).json({
                code: 404,
                message: 'Account type not found',
                status: false,
                data: null,
            });
        }

        await existingTempRegist.update({
            account_type_id: accountType.id,
            step: step + 1,
            updated_at: new Date().toISOString(),
        });

        const otpExpiredFormatted = formatToJakartaTime(existingTempRegist.otp_expired_date);

        return res.status(200).json({
            code: 200,
            message: 'Account type success selected',
            data: {
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
            },
        });

    } catch (error) {
        console.error('Error during account type selection:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            error: error.message || 'An unknown error occurred',
            data: null,
        });
    }
};