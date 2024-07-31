import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if(!authHeader){
        return res.status(401).send('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, jwtSecret, (err, decoded) => {
        // console.log('tes', decoded)
        if (err){
            return res.status(401).send('Invalid token');
        }

        req.user = {
            userId: decoded.id
        };

        next();
    })
}