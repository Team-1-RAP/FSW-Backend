import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export const sendOTPEmail = async (email, otp, name) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: EMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                    .container { width: 100%; max-width: 600px; margin: auto; padding: 20px; }
                    .header { background-color: #2FA6FC; color: white; padding: 10px; text-align: center; }
                    .footer { background-color: #f1f1f1; color: #333; padding: 10px; text-align: center; font-size: 12px; }
                    .content { padding: 20px; background-color: #ffffff; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                    .otp-code { font-size: 24px; font-weight: bold; color: #4CAF50; }
                    @media (max-width: 600px) {
                        .container { width: 100%; padding: 10px; }
                        .header, .footer { font-size: 14px; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Simple Bank</h1>
                    </div>
                    <div class="content">
                        <p>Halo, ${name}</p>
                        <p>Kode OTP kamu adalah: <span class="otp-code">${otp}</span></p>
                        <p>Kode ini berlaku selama 10 menit sejak diterima. Gunakan kode ini pada aplikasi SimpleBank.</p>
                        <p>Harap abaikan email ini jika kamu tidak meminta kode OTP.</p>
                        <p>Terima kasih,</p>
                        <p>Tim SimpleBank</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Simple Bank Teams. All rights reserved.</p>
                        <p>Simple Bank Teams Binar | <a href="mailto:simplebankteams@gmail.com">Contact Us</a> | <a href="#">Unsubscribe</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: 'Kode OTP Anda',
            html: htmlContent,
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Error sending OTP email');
    }
};