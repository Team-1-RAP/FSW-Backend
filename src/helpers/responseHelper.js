export const sendResponse = (res, code, message, status, data) => {
    return res.status(code).json({
        code,
        message,
        status,
        data,
    });
};

export const sendErrResponse = (res, code, message, status, error) => {
    return res.status(code).json({
        code,
        message,
        status,
        error,
    });
};