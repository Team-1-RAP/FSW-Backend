import multer from 'multer';

export function multerErrorHandler(err, req, res, next) {
    if (err) {
        let statusCode = 500;
        let status = false;
        let message = 'Internal Server Error';
        let data = null;

        if (err instanceof multer.MulterError) {
            statusCode = 400;
            message = err.code === 'LIMIT_FILE_SIZE' 
                ? 'File size exceeds the maximum limit of 2MB'
                : err.message;
        } else if (err.message.includes('Format only .jpg and .jpeg')) {
            statusCode = 400;
            message = 'Invalid file format. Only .jpg and .jpeg are allowed';
        }

        return res.status(statusCode).json({ code: statusCode, message, status, data });
    }

    next();
}