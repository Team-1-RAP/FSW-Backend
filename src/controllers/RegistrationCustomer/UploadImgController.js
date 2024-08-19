import cloudinary from '../../config/cloudinary.js';
import TemporaryRegistration from '../../models/TemporaryRegistration.js';

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

        const { step } = tempRegist;

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

        // Update TemporaryRegistration 
        const updatedRegistration = await TemporaryRegistration.update({
            ktp_document: ktpUploadResult.secure_url,
            photo_document: photoUploadResult.secure_url,
            signature_document: signatureUploadResult.secure_url
        }, {
            where: { username }
        });

        if (updatedRegistration[0] === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Username not found',
                data: null
            });
        }

        return res.status(200).json({
            code: 200,
            message: 'Files uploaded successfully',
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