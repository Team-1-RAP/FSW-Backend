import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import { formatToJakartaTime } from "../../utils/dateUtils.js"

export const verifyEmail = async (req, res) => {
    const { username, otp } = req.body;

    try {
        if (!username || !otp) {
            return res.status(404).json({
                code: 404,
                message: 'Username and OTP code cannot be empty',
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

        const { step, otp_code, otp_expired_date } = existingTempRegist;

        if (step > 1) {
            return res.status(400).json({
                code: 400,
                message: 'Email verification is already completed',
                status: false,
                data: null,
            });
        }

        const isOtpValid = otp_code === otp && new Date(otp_expired_date) > new Date();
        
        if (isOtpValid) {
            await existingTempRegist.update({
                otp_verified: true,
                step: step + 1,
                updated_at: new Date().toISOString(),
            });

            const otpExpiredFormatted = formatToJakartaTime(otp_expired_date);

            return res.status(200).json({
                code: 200,
                message: 'Email verification success',
                data: {
                    data_customer: {
                        email: existingTempRegist.email,
                        username: existingTempRegist.username
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
        } else {
            return res.status(400).json({
                code: 400,
                message: 'Invalid or expired OTP code',
                status: false,
                data: null,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            error: error.message || 'An unknown error occurred',
            data: null,
        });
    }
};
