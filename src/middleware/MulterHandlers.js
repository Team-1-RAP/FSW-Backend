import multer from 'multer';
export function multerErrorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                code: 400,
                message: 'File size exceeds the maximum limit of 2MB'
            });
        }
        return res.status(400).json({
            code: 400,
            message: err.message
        });
    }
    if (err) {
        return res.status(500).json({
            code: 500,
            message: 'Internal Server Error'
        });
    }
    next();
}