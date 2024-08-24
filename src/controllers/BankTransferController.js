import { validateBankTransfer } from '../service/bankTransferService.js';
import { sendResponse, sendErrResponse } from '../helpers/responseHelper.js';

export const bankTransferValidation = async (req, res) => {
    try {
        const result = await validateBankTransfer(req.body, req.user.userId);

        if (result.error) {
            return sendResponse(res, result.status, result.message, false, null);
        }

        return sendResponse(res, 200, 'Bank transfer validation success', true, result.data);
        
    } catch (error) {
        console.error('Error:', error);
        return sendErrResponse(res, 500, 'Internal server error', false, { error: error.message });
    }
};