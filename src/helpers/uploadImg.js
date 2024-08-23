import cloudinary from '../config/cloudinary.js'
export const uploadImage = (file, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image', folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        ).end(file.buffer);
    });
};