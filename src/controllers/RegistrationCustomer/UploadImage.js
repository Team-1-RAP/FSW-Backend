import cloudinary from '../../config/cloudinary.js';
import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import Account from '../../models/Accounts.js';
import AccountTypes from '../../models/AccountTypes.js';
import AccountPurpose from '../../models/AccountPurpose.js';
import { sendEmailConfirmation, sendCreatePin } from '../../utils/emailUtils.js';
import { formatToJakartaTime } from '../../utils/dateUtils.js';
import { sendResponse } from '../../helpers/responseHelper.js';
import { Op } from 'sequelize';

const uploadImage = (file, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image', folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        ).end(file.buffer);
    });
};

const generateAccountNumber = async (accountType) => {
    const bankCode = '01';
    const accountTypeCode = accountType.code;
    const lastAccount = await Account.findOne({ order: [['no', 'DESC']] });
    const serialNumber = lastAccount ? String(parseInt(lastAccount.no.slice(-6)) + 1).padStart(6, '0') : '000001';
    return `${bankCode}${accountTypeCode}${serialNumber}`;
};

const generateCardNumber = async () => {
    const lastCard = await Account.findOne({
        where: { atm_card_no: { [Op.like]: '51%' } },
        order: [['atm_card_no', 'DESC']],
    });

    const cardPrefix = lastCard ? String(parseInt(lastCard.atm_card_no.slice(0, 6)) + 1).padStart(6, '0') : '510001';
    const uniqueNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    const cardNumber = `${cardPrefix}${uniqueNumber}`;
    const existingCard = await Account.findOne({ where: { atm_card_no: cardNumber } });

    if (existingCard) throw new Error('Generated card number is not unique, please try again');

    return cardNumber;
};

const schedulePinEmail = (email, accountNumber, cardNumber, fullname) => {
    setTimeout(async () => {
        try {
            await sendCreatePin(email, accountNumber, cardNumber, fullname);
            console.log('PIN email sent success');
        } catch (emailError) {
            console.error('Error sending PIN email:', emailError);
        }
    }, 300000);
};

export const uploadImg = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return sendResponse(res, 400, 'Username cannot be empty');

        const tempRegist = await TemporaryRegistration.findOne({ where: { username } });
        if (!tempRegist) return sendResponse(res, 404, 'Username not found', null, false);

        const { step, email, fullname } = tempRegist;
        if (step < 4) return sendResponse(res, 400, 'Previous steps not completed', null, false);
        if (step > 4) return sendResponse(res, 400, 'Upload data image is already completed', null, false);

        if (!req.files || !req.files.ktp_document || !req.files.photo_document || !req.files.signature_document) {
            return sendResponse(res, 400, 'All data files cannot be empty', null, false);
        }

        const [ktpUploadResult, photoUploadResult, signatureUploadResult] = await Promise.all([
            uploadImage(req.files.ktp_document[0], 'ktp'),
            uploadImage(req.files.photo_document[0], 'photos'),
            uploadImage(req.files.signature_document[0], 'signature')
        ]);

        const accountType = await AccountTypes.findOne({ where: { id: tempRegist.account_type_id } });
        if (!accountType) return sendResponse(res, 404, 'Account type not found', null, false);

        const accountPurpose = await AccountPurpose.findOne({ where: { id: tempRegist.purpose_id } });
        if (!accountPurpose) return sendResponse(res, 404, 'Account purpose not found', null, false);

        const accountNumber = await generateAccountNumber(accountType);
        const cardNumber = await generateCardNumber();

        await TemporaryRegistration.update({
            no_account: accountNumber,
            atm_card: cardNumber,
            ktp_document: ktpUploadResult.secure_url,
            photo_document: photoUploadResult.secure_url,
            signature_document: signatureUploadResult.secure_url,
            step: step + 1
        }, { where: { username } });

        const updatedTempRegist = await TemporaryRegistration.findOne({ where: { username } });
        if (!updatedTempRegist) return sendResponse(res, 404, 'Username not found', null, false);

        await sendEmailConfirmation(email, fullname);
        schedulePinEmail(email, updatedTempRegist.no_account, updatedTempRegist.atm_card, fullname);

        const otpExpiredFormatted = formatToJakartaTime(updatedTempRegist.otp_expired_date);

        return sendResponse(res, 200, 'Files uploaded success',{
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
                step: updatedTempRegist.step,
                created_at: updatedTempRegist.created_at,
                updated_at: updatedTempRegist.updated_at,
            }
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        return sendResponse(res, 500, 'Internal Server Error', null, error.message);
    }
};