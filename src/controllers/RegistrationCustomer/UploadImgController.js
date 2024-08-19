import cloudinary from '../../config/cloudinary.js';
import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import Account from '../../models/Accounts.js';
import { sendEmailConfirmation, sendCreatePin } from '../../utils/emailUtils.js';
import { Op } from 'sequelize'; 
import AccountTypes from '../../models/AccountTypes.js';

export const uploadImg = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                code: 400,
                message: 'Username cannot be empty',
                data: null
            });
        }

        const tempRegist = await TemporaryRegistration.findOne({ where: { username } });

        if (!tempRegist) {
            return res.status(404).json({
                code: 404,
                message: 'Username not found',
                status: false,
                data: null,
            });
        }

        const { step, account_type_id, email, fullname } = tempRegist;

        if (step < 4) {
            return res.status(400).json({
                code: 400,
                message: 'Previous steps not completed',
                status: false,
                data: null,
            });
        }

        if (!req.files || !req.files.ktp_document || !req.files.photo_document || !req.files.signature_document) {
            return res.status(400).json({
                code: 400,
                message: 'All data files cannot be empty',
                status: false,
                data: null
            });
        }

        // Upload KTP 
        const ktpUploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: 'image', folder: 'ktp' }, 
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            ).end(req.files.ktp_document[0].buffer);
        });

        // Upload Photo
        const photoUploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: 'image', folder: 'photos' }, 
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            ).end(req.files.photo_document[0].buffer);
        });

        // Upload Signature
        const signatureUploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: 'image', folder: 'signature' }, 
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            ).end(req.files.signature_document[0].buffer);
        });

        const accountType = await AccountTypes.findOne({ where: { id: account_type_id } });
        if (!accountType) {
            return res.status(404).json({
                code: 404,
                message: 'Account type not found',
                status: false,
                data: null,
            });
        }

        const bankCode = '01';
        const accountTypeCode = accountType.code;

        // Get last account number
        const lastAccount = await Account.findOne({
            order: [['no', 'DESC']],
        });

        let serialNumber = '000001';

        if (lastAccount) {
            const lastSerial = parseInt(lastAccount.no.slice(-6));
            serialNumber = String(lastSerial + 1).padStart(6, '0');
        }

        const accountNumber = `${bankCode}${accountTypeCode}${serialNumber}`;

        const lastCard = await Account.findOne({
            where: {
                atm_card_no: {
                    [Op.like]: '51%' 
                }
            },
            order: [['atm_card_no', 'DESC']],
        });

        let cardPrefix = '510001'; 

        if (lastCard) {
            const lastCardPrefix = parseInt(lastCard.atm_card_no.slice(0, 6));
            cardPrefix = String(lastCardPrefix + 1).padStart(6, '0');
        }

        // Generate a unique 10-digit
        const uniqueNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
        const cardNumber = `${cardPrefix}${uniqueNumber}`;
        
        const existingCard = await Account.findOne({ where: { atm_card_no: cardNumber } });
        if (existingCard) {
            return res.status(400).json({
                code: 400,
                message: 'Generated card number is not unique, please try again',
                status: false,
                data: null,
            });
        }

        const [updatedCount] = await TemporaryRegistration.update({
            no_account: accountNumber,
            atm_card: cardNumber,
            ktp_document: ktpUploadResult.secure_url,
            photo_document: photoUploadResult.secure_url,
            signature_document: signatureUploadResult.secure_url,
            step: tempRegist.step + 1
        }, {
            where: { username }
        });

        await sendEmailConfirmation(email, fullname);

        setTimeout(async () => {
            try {
                await sendCreatePin(email, tempRegist.no_account, tempRegist.atm_card, fullname);
            } catch (emailError) {
                console.error('Error sending PIN email:', emailError);
            }
        }, 300000);

        return res.status(200).json({
            code: 200,
            message: 'Files uploaded success',
            data: {
                ktp_url: ktpUploadResult.secure_url,
                photo_url: photoUploadResult.secure_url,
                signature_url: signatureUploadResult.secure_url
            }
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal Server Error',
            error: error.message || 'An unknown error occurred',
            data: null
        });
    }
};