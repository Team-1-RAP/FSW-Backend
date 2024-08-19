import bcrypt from 'bcrypt';
import TemporaryRegistration from '../models/TemporaryRegistration.js';
import Customer from "../models/Customers.js";
import Account from '../models/Accounts.js';
import AccountPurpose from '../models/AccountPurpose.js';
import { sendOTPEmail } from "../utils/emailUtils.js";
import { generateOTP } from "../utils/generateOtpUtils.js";
import { formatToJakartaTime } from "../utils/dateUtils.js"
import AccountTypes from '../models/AccountTypes.js';
import sequelize from '../config/config.js';
import { validateEmail, validateUsername, validatePassword, validatePin, validateNik } from "../utils/validationUtils.js";

export const registrationAccount = async (req, res) => {
    const { email, username, password, confirmPassword } = req.body;

    try {
        if (!email || !username || !password || !confirmPassword) {
            return res.status(400).json({
                code: 400,
                message: 'Data cannot be null',
                status: false,
                data: null,
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                code: 400,
                message: 'Invalid email format',
                status: false,
                data: null,
            });
        }

        if (!validateUsername(username)) {
            return res.status(400).json({
                code: 400,
                message: 'Invalid username format. It must be 6 characters and cannot contain only numbers',
                status: false,
                data: null,
            });
        }

        const existingCustomer = await Customer.findOne({ where: { username } });
        const existingTempRegist = await TemporaryRegistration.findOne({ where: { username }});

        if (existingCustomer) {
            return res.status(400).json({
                code: 400,
                message: 'Username is already taken',
                status: false,
                data: null,
            });
        }

        const passwordValidation = validatePassword(password, confirmPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                code: 400,
                message: passwordValidation.message,
                status: false,
                data: null,
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // jika data ada di tabel temporary dan step not completed
        if (existingTempRegist) {
            await existingTempRegist.update({
                email,
                password: hashedPassword,
                otp_code: otp,
                otp_expired_date: otpExpiry,
                step: 1,  
                updated_at: new Date(),
            });
            await sendOTPEmail(email, otp, username);

            const otpExpiredFormatted = formatToJakartaTime(otpExpiry);

            return res.status(200).json({
                code: 200,
                message: 'Temporary registration updated',
                data: {
                    data_customer: {
                        email: existingTempRegist.email,
                        username: existingTempRegist.username,
                    },
                    registration: {
                        otp_code: existingTempRegist.otp_code,
                        otp_verified: existingTempRegist.otp_verified,
                        otp_expired_date: otpExpiredFormatted,
                        step: existingTempRegist.step,
                        created_at: existingTempRegist.created_at,
                        updated_at: existingTempRegist.updated_at
                    }
                },
            });
        } else {
            const newRegistration = await TemporaryRegistration.create({
                email,
                username,
                password: hashedPassword,
                otp_code: otp,
                otp_expired_date: otpExpiry,
                step: 1,  
                created_at: new Date(),
                updated_at: new Date(),
            });
            await sendOTPEmail(email, otp, username);

            const otpExpiredFormatted = formatToJakartaTime(otpExpiry);

            return res.status(201).json({
                code: 201,
                message: 'Temporary registration success created',
                data: {
                    data_customer: {
                        email: newRegistration.email,
                        username: newRegistration.username,
                    },
                    registration: {
                        otp_code: newRegistration.otp_code,
                        otp_verified: newRegistration.otp_verified,
                        otp_expired_date: otpExpiredFormatted,
                        step: newRegistration.step,
                        created_at: newRegistration.created_at,
                        updated_at: newRegistration.updated_at
                    }
                },
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            error: error.message || 'An unknown error occurred',
            data: null,
        });
    }
};

export const verifyEmail = async (req, res) => {
    const { username, otp } = req.body;

    try {
        if (!username || !otp) {
            return res.status(404).json({
                code: 404,
                message: 'Username and OTP code cannot be empty',
                status: false,
                data: null,
            });
        }

        const existingTempRegist = await TemporaryRegistration.findOne({ where: { username } });

        if (!existingTempRegist) {
            return res.status(404).json({
                code: 404,
                message: 'Username not found',
                status: false,
                data: null,
            });
        }

        const { step, otp_code, otp_expired_date } = existingTempRegist;

        if (step !== 1) {
            return res.status(400).json({
                code: 400,
                message: 'Initial registration stage is not completed or failed',
                status: false,
                data: null,
            });
        }

        const isOtpValid = otp_code === otp && new Date(otp_expired_date) > new Date();
        
        if (isOtpValid) {
            await existingTempRegist.update({
                otp_verified: true,
                step: step + 1,
                updated_at: new Date().toISOString(),
            });

            const otpExpiredFormatted = formatToJakartaTime(otp_expired_date);

            return res.status(200).json({
                code: 200,
                message: 'Email verification success',
                data: {
                    data_customer: {
                        email: existingTempRegist.email,
                        username: existingTempRegist.username
                    },
                    registration: {
                        otp_code: existingTempRegist.otp_code,
                        otp_verified: existingTempRegist.otp_verified,
                        otp_expired_date: otpExpiredFormatted,
                        step: existingTempRegist.step,
                        created_at: existingTempRegist.created_at,
                        updated_at: existingTempRegist.updated_at,
                    },
                },
            });
        } else {
            return res.status(400).json({
                code: 400,
                message: 'Invalid or expired OTP code',
                status: false,
                data: null,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            error: error.message || 'An unknown error occurred',
            data: null,
        });
    }
};

export const accountType = async (req, res) => {
    const { username, accountTypeId } = req.body;

    try {
        if (!username || !accountTypeId) {
            return res.status(400).json({
                code: 400,
                message: 'Username and type of account cannot be empty',
                status: false,
                data: null,
            });
        }

        const existingTempRegist = await TemporaryRegistration.findOne({ where: { username } });

        if (!existingTempRegist) {
            return res.status(404).json({
                code: 404,
                message: 'Username not found',
                status: false,
                data: null,
            });
        }

        const { step } = existingTempRegist;

        if (step < 2) {
            return res.status(400).json({
                code: 400,
                message: 'Previous steps not completed',
                status: false,
                data: null,
            });
        }

        if (step > 2) {
            return res.status(400).json({
                code: 400,
                message: 'Email verification is already completed',
                status: false,
                data: null,
            });
        }

        const accountType = await AccountTypes.findOne({ where: { id: accountTypeId } });
        
        if (!accountType) {
            return res.status(404).json({
                code: 404,
                message: 'Account type not found',
                status: false,
                data: null,
            });
        }

        await existingTempRegist.update({
            account_type_id: accountType.id,
            step: step + 1,
            updated_at: new Date().toISOString(),
        });

        const otpExpiredFormatted = formatToJakartaTime(existingTempRegist.otp_expired_date);

        return res.status(200).json({
            code: 200,
            message: 'Account type success selected',
            data: {
                data_customer: {
                    email: existingTempRegist.email,
                    username: existingTempRegist.username,
                },
                data_account: {
                    account_code: accountType.code,
                    account_type: accountType.type,
                },
                registration: {
                    otp_code: existingTempRegist.otp_code,
                    otp_verified: existingTempRegist.otp_verified,
                    otp_expired_date: otpExpiredFormatted,
                    step: existingTempRegist.step,
                    created_at: existingTempRegist.created_at,
                    updated_at: existingTempRegist.updated_at,
                },
            },
        });

    } catch (error) {
        console.error('Error during account type selection:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
            error: error.message || 'An unknown error occurred',
            data: null,
        });
    }
};

export const personalData = async (req, res) => {
    const { username, fullname, nik, born_date, address, accountPurpose_id } = req.body;

    try {
        if (!username || !fullname || !nik || !born_date || !address || !accountPurpose_id) {
            return res.status(400).json({
                code: 400,
                message: 'Data cannot be empty',
                status: false,
                data: null,
            });
        }

        const formattedBornDate = new Date(born_date).toISOString().split('T')[0];

        const existingTempRegist = await TemporaryRegistration.findOne({ where: { username } });

        if (!existingTempRegist) {
            return res.status(404).json({
                code: 404,
                message: 'Username not found',
                status: false,
                data: null,
            });
        }

        const { step } = existingTempRegist;

        if (step < 3) {
            return res.status(400).json({
                code: 400,
                message: 'Previous steps not completed',
                status: false,
                data: null,
            });
        }

        if (step > 3) {
            return res.status(400).json({
                code: 400,
                message: 'Personal data is already completed',
                status: false,
                data: null,
            });
        }

        const nikValidation = validateNik(nik);
        if (!nikValidation.valid) {
            return res.status(400).json({
                code: 400,
                message: nikValidation.message,
                status: false,
                data: null,
            });
        }

        const accountPurpose = await AccountPurpose.findOne({ where: { id: accountPurpose_id } });
        if (!accountPurpose) {
            return res.status(404).json({
                code: 404,
                message: 'Account purpose not found',
                status: false,
                data: null,
            });
        }

        await existingTempRegist.update({
            fullname,
            nik,
            born_date: formattedBornDate,  
            address,
            purpose_id: accountPurpose.id,
            step: step + 1,
            updated_at: new Date().toISOString(),
        });

        const otpExpiredFormatted = formatToJakartaTime(existingTempRegist.otp_expired_date);

        return res.status(200).json({
            code: 200,
            message: 'Account type success selected',
            data: {
                data_customer: {
                    email: existingTempRegist.email,
                    username: existingTempRegist.username,
                    fullname: existingTempRegist.fullname,
                    nik: existingTempRegist.nik,
                    born_date: formattedBornDate, 
                    address: existingTempRegist.address,
                },
                data_account: {
                    account_purpose_id: accountPurpose.id,
                    account_purpose: accountPurpose.type,
                },
                registration: {
                    otp_code: existingTempRegist.otp_code,
                    otp_verified: existingTempRegist.otp_verified,
                    otp_expired_date: otpExpiredFormatted,
                    step: existingTempRegist.step,
                    created_at: existingTempRegist.created_at,
                    updated_at: existingTempRegist.updated_at,
                },
            },
        });

    } catch (error) {
        console.error('Error during personal data submission:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal Server Error',
            error: error.message || 'An unknown error occurred',
            data: null,
        });
    }
};


// upload document disini di taruh di cloud storage {save di temporary table - parameter yg dibawa: username}

export const createPin = async (req, res) => {
    const { pin, confirmPin } = req.body;
    const { username } = req.params;

    try {
        if (!username || !pin || !confirmPin) {
            return res.status(400).json({
                code: 400,
                message: 'Username, PIN, dan konfirmasi PIN tidak boleh kosong',
                status: false,
                data: null,
            });
        }

        const tempRegist = await TemporaryRegistration.findOne({ where: { username } });

        if (!tempRegist) {
            return res.status(404).json({
                code: 404,
                message: 'Username not found',
                status: false,
                data: null,
            });
        }

        const { step, account_type_id } = tempRegist;

        if (step < 5) {
            return res.status(400).json({
                code: 400,
                message: 'Previous steps not completed',
                status: false,
                data: null,
            });
        }

        const pinValidation = validatePin(pin, confirmPin);
        if (!pinValidation.valid) {
            return res.status(400).json({
                code: 400,
                message: pinValidation.message,
                status: false,
                data: null,
            });
        }

        const accountType = await AccountTypes.findOne({ where: { id: account_type_id } });

        if (!accountType) {
            return res.status(404).json({
                code: 404,
                message: 'Account type not found',
                status: false,
                data: null,
            });
        }

        const accountTypeName = accountType.type;

        const transaction = await sequelize.transaction();

        try {
            const newCustomer = await Customer.create({
                fullname: tempRegist.fullname,
                username: tempRegist.username,
                password: tempRegist.password,
                email: tempRegist.email,
                phoneNumber: tempRegist.phone_number,
                nik: tempRegist.nik,
                bornDate: tempRegist.born_date,
                address: tempRegist.address,
                ktpFile: tempRegist.ktp_document,
                photoFile: tempRegist.photo_document,
                signatureFile: tempRegist.signature_document,
                createdDate: new Date(),
                updatedDate: new Date(),
            }, { transaction });

            await Account.create({
                no: tempRegist.no_account,
                createdAt: new Date(),
                updatedAt: new Date(),
                accountTypeName: accountTypeName,
                atm_card_no: tempRegist.atm_card,
                expDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
                createdDate: new Date(),
                updatedDate: new Date(),
                bankId: 1,
                userId: newCustomer.id,
                pin,
                accountTypeId: tempRegist.account_type_id,
                accountPurposeId: tempRegist.purpose_id,
            }, { transaction });

            await TemporaryRegistration.destroy({ where: { id: tempRegist.id }, transaction });

            await transaction.commit();

            return res.status(200).json({
                code: 200,
                message: 'Pin success created, please login with your username and password',
                status: true,
                data: null,
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Error during account creation:', error);
            return res.status(500).json({
                code: 500,
                message: 'Internal Server Error',
                error: error.message || 'An unknown error occurred',
                data: null,
            });
        }

    } catch (error) {
        console.error('Error during PIN creation:', error);
        return res.status(500).json({
            code: 500,
            message: 'Internal Server Error',
            error: error.message || 'An unknown error occurred',
            data: null,
        });
    }
};
