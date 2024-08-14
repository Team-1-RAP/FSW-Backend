import AccountTypes from "../models/AccountTypes.js";

export const getAccountType = async (req, res) => {
    try {
        const accountTypes = await AccountTypes.findAll();

        if (accountTypes.length > 0) {
            return res.status(200).json({
                code: 200,
                message: 'Get all account types success',
                status: true,
                data: accountTypes,
            });
        } else {
            return res.status(404).json({
                code: 404,
                message: 'No account types found',
                status: false,
                data: null,
            });
        }
    } catch (error) {
        console.error('Error retrieving account types:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            error: error.message || 'An unknown error occurred',
            data: null,
        });
    }
};
