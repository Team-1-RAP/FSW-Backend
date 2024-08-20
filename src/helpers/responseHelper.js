export const sendResponse = (res, code, message, data, status) => {
    return res.status(code).json({
        code,
        message,
        status,
        data,
    });
};