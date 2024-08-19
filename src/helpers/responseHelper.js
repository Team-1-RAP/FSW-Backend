export const sendResponse = (res, code, message, data = null, status = false) => {
    return res.status(code).json({
        code,
        message,
        status,
        data,
    });
};