import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import AccountTypes from '../../models/AccountTypes.js';
import AccountPurpose from '../../models/AccountPurpose.js';
import { formatToJakartaTime } from '../../utils/dateUtils.js';
import { sendResponse, sendErrResponse } from '../../helpers/responseHelper.js';
import { uploadImage } from '../../helpers/uploadImg.js';
import { sendEmailConfirmation, sendCreatePin } from '../../utils/emailUtils.js';
import { generateNewAccountNumber, generateNewCardNumber } from '../../utils/generateAccount.js';
import { validateNik } from '../../utils/validationUtils.js';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

export const customerData = async (req, res) => {
    const { username, accountTypeId, fullname, nik, born_date, address, accountPurpose_id } = req.body;

    try {
        if (!username || !accountTypeId || !fullname || !nik || !born_date || !address || !accountPurpose_id) {
            return sendResponse(res, 400, 'Data cannot be null', false, null);
        }

        const formattedBornDate = new Date(born_date).toISOString().split('T')[0];
        const existingTempRegist = await TemporaryRegistration.findOne({ where: { username } });

        if (!existingTempRegist) {
            return sendResponse(res, 404, 'Username not found', false, null);
        }

        const accountType = await AccountTypes.findOne({ where: { id: accountTypeId } });
        if (!accountType) {
            return sendResponse(res, 404, 'Account type not found', false, null);
        }

        const nikValidation = await validateNik(nik);
        if (!nikValidation.valid) {
            return sendResponse(res, 400, nikValidation.message, false, null);
        }

        const accountPurpose = await AccountPurpose.findOne({ where: { id: accountPurpose_id } });
        if (!accountPurpose) {
            return sendResponse(res, 404, 'Account purpose not found', false, null);
        }

        if (!req.files || !req.files.ktp_document || !req.files.photo_document || !req.files.signature_document) {
            return sendResponse(res, 400, 'All data files cannot be empty', false, null);
        }

        const [ktpUploadResult, photoUploadResult, signatureUploadResult] = await Promise.all([
            uploadImage(req.files.ktp_document[0], 'ktp'),
            uploadImage(req.files.photo_document[0], 'photos'),
            uploadImage(req.files.signature_document[0], 'signature')
        ]);

        const accountNumber = await generateNewAccountNumber(accountType);
        const cardNumber = await generateNewCardNumber();

        await existingTempRegist.update({
            account_type_id: accountType.id,
            fullname,
            nik,
            born_date: formattedBornDate,
            address,
            purpose_id: accountPurpose.id,
            no_account: accountNumber,
            atm_card: cardNumber,
            ktp_document: ktpUploadResult.secure_url,
            photo_document: photoUploadResult.secure_url,
            signature_document: signatureUploadResult.secure_url,
            updated_at: new Date().toISOString(),
        });

        const updatedTempRegist = await TemporaryRegistration.findOne({ where: { username } });
        if (!updatedTempRegist) {
            return sendResponse(res, 404, 'Username not found after update', false, null);
        }

        await sendEmailConfirmation(updatedTempRegist.email, updatedTempRegist.fullname);
        const token = await sendCreatePin(
            updatedTempRegist.email,
            updatedTempRegist.no_account,
            updatedTempRegist.atm_card,
            updatedTempRegist.username,
            updatedTempRegist.fullname
        );

        const otpExpiredFormatted = formatToJakartaTime(updatedTempRegist.otp_expired_date);

        return sendResponse(res, 200, 'Files uploaded successfully', true, {
            data_customer: {
                email: updatedTempRegist.email,
                username: updatedTempRegist.username,
                fullname: updatedTempRegist.fullname,
                nik: updatedTempRegist.nik,
                born_date: updatedTempRegist.born_date,
                address: updatedTempRegist.address,
            },
            data_account: {
                account_no: updatedTempRegist.no_account,
                atm_card_no: updatedTempRegist.atm_card,
                accountTypeId: accountType.id,
                accountTypeCode: accountType.code,
                accountTypeName: accountType.type,
                account_purpose_id: accountPurpose.id,
                account_purpose: accountPurpose.type,
            },
            document: {
                ktp_url: ktpUploadResult.secure_url,
                photo_url: photoUploadResult.secure_url,
                signature_url: signatureUploadResult.secure_url,
            },
            registration: {
                otp_code: updatedTempRegist.otp_code,
                otp_verified: updatedTempRegist.otp_verified,
                otp_expired_date: otpExpiredFormatted,
                created_at: updatedTempRegist.created_at,
                updated_at: updatedTempRegist.updated_at,
                accessToken: token,
                token_expDate: new Date(jwt.verify(token, jwtSecret).exp * 1000).toISOString(),
            }
        });
    } catch (error) {
        console.error('Error during customer data processing:', error);
        return sendErrResponse(res, 500, 'Internal server error', false, { error: error.message });
    }
};