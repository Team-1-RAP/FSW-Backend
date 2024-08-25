import AccountTypes from "../models/AccountTypes.js";
import AccountPurpose from "../models/AccountPurpose.js";
import { sendResponse, sendErrResponse } from '../helpers/responseHelper.js';

export const getAccountType = async (req, res) => {
    try {
        const accountTypes = await AccountTypes.findAll();

        if (!accountTypes.length) {
            return sendResponse(res, 404, 'No account types found', false, null);
        } 

        return sendResponse(res, 200, 'Get all account types success', true, accountTypes)
    } catch (error) {
        console.error('Error retrieving account types:', error);
        return sendErrResponse(res, 500, 'Internal Server Error', false, { error: error.message || 'An unknown error occurred' });
    }
};

export const getAccountPurposes = async (req, res) => {
    try {
        const accountPurposeData = await AccountPurpose.findAll();

        if (!accountPurposeData.length) {
            return sendResponse(res, 404, 'No account purposes found', false, null);
        } 

        return sendResponse(res, 200, 'Get all account purposes success', true, accountPurposeData)
    } catch (error) {
        console.error('Error retrieving account types:', error);
        return sendErrResponse(res, 500, 'Internal Server Error', false, { error: error.message || 'An unknown error occurred' });
    }
};