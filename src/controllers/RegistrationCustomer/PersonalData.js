import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import AccountPurpose from '../../models/AccountPurpose.js';
import { formatToJakartaTime } from "../../utils/dateUtils.js"
import AccountTypes from '../../models/AccountTypes.js';
import { validateNik } from "../../utils/validationUtils.js";

export const personalData = async (req, res) => {
    const { username, fullname, nik, born_date, address, accountPurpose_id } = req.body;

    try {
        if (!username || !fullname || !nik || !born_date || !address || !accountPurpose_id) {
            return res.status(400).json({
                code: 400,
                message: 'Data cannot be empty',
                status: false,
                data: null,
            });
        }

        const formattedBornDate = new Date(born_date).toISOString().split('T')[0];

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

        if (step < 3) {
            return res.status(400).json({
                code: 400,
                message: 'Previous steps not completed',
                status: false,
                data: null,
            });
        }

        if (step > 3) {
            return res.status(400).json({
                code: 400,
                message: 'Personal data is already completed',
                status: false,
                data: null,
            });
        }

        const nikValidation = validateNik(nik);
        if (!nikValidation.valid) {
            return res.status(400).json({
                code: 400,
                message: nikValidation.message,
                status: false,
                data: null,
            });
        }

        const accountPurpose = await AccountPurpose.findOne({ where: { id: accountPurpose_id } });
        if (!accountPurpose) {
            return res.status(404).json({
                code: 404,
                message: 'Account purpose not found',
                status: false,
                data: null,
            });
        }

        const accountType = await AccountTypes.findOne({ where: { id: existingTempRegist.account_type_id } });
        
        if (!accountType) {
            return res.status(404).json({
                code: 404,
                message: 'Account type not found',
                status: false,
                data: null,
            });
        }

        await existingTempRegist.update({
            fullname,
            nik,
            born_date: formattedBornDate,  
            address,
            purpose_id: accountPurpose.id,
            step: existingTempRegist.step + 1,
            updated_at: new Date().toISOString(),
        });

        const otpExpiredFormatted = formatToJakartaTime(existingTempRegist.otp_expired_date);

        return res.status(200).json({
            code: 200,
            message: 'Formulir profile succes updated',
            data: {
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
            },
        });

    } catch (error) {
        console.error('Error during personal data submission:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal Server Error',
            error: error.message || 'An unknown error occurred',
            data: null,
        });
    }
};