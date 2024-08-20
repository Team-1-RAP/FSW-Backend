export const sendResponse = (res, code, message, status, data) => {
    return res.status(code).json({
        code,
        message,
        status,
        data,
    });
};