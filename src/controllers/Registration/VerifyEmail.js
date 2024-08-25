import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import { formatToJakartaTime } from '../../utils/dateUtils.js';
import { sendResponse, sendErrResponse } from '../../helpers/responseHelper.js';

export const verifyEmail = async (req, res) => {
    const { username, otp } = req.body;

    try {
        if (!username || !otp) {
            return sendResponse(res, 400, 'Username and OTP code cannot be null', false, null);
        }

        const existingTempRegist = await TemporaryRegistration.findOne({ where: { username } });

        if (!existingTempRegist) {
            return sendResponse(res, 404, 'Username not found', false, null);
        }

        const { otp_code, otp_expired_date } = existingTempRegist;

        const isOtpValid = otp_code === otp && new Date(otp_expired_date) > new Date();

        if (isOtpValid) {
            await existingTempRegist.update({
                otp_verified: true,
                updated_at: new Date().toISOString(),
            });

            const otpExpiredFormatted = formatToJakartaTime(otp_expired_date);

            return sendResponse(res, 200, 'Email verification success', true, {
                data_customer: {
                    email: existingTempRegist.email,
                    username: existingTempRegist.username,
                },
                registration: {
                    otp_code: existingTempRegist.otp_code,
                    otp_verified: existingTempRegist.otp_verified,
                    otp_expired_date: otpExpiredFormatted,
                    created_at: existingTempRegist.created_at,
                    updated_at: existingTempRegist.updated_at,
                },
            }, true);
        } else {
            return sendResponse(res, 400, 'Invalid or expired OTP code', false, null);
        }
    } catch (error) {
        console.error(error);
        return sendErrResponse(res, 500, 'Internal server error', false, { error: error.message });
    }
};