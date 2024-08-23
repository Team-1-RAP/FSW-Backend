import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import Customer from '../../models/Customers.js';
import Account from '../../models/Accounts.js';
import AccountPurpose from '../../models/AccountPurpose.js';
import OAuthUserRole from '../../models/OAuthUserRole.js';
import Role from '../../models/Roles.js';
import AccountTypes from '../../models/AccountTypes.js';
import sequelize from '../../config/config.js';
import { validatePin } from '../../utils/validationUtils.js';
import { sendResponse, sendErrResponse } from '../../helpers/responseHelper.js';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

const getTempRegistByAccountNo = async (accountNo) => {
    return await TemporaryRegistration.findOne({ where: { no_account: accountNo } });
};

const getAccountType = async (accountTypeId) => {
    return await AccountTypes.findOne({ where: { id: accountTypeId } });
};

const getAccountWithPurpose = async (accountNo) => {
    return await Account.findOne({
        where: { no: accountNo },
        include: [{ model: AccountPurpose, as: 'accountPurpose' }]
    });
};

const handleTransactionError = (res, error, logMessage) => {
    console.error(`${logMessage}:`, error);
    return sendErrResponse(res, 500, 'Internal Server Error', false, error.message);
};

export const createPin = async (req, res) => {
    const { pin, confirmPin } = req.body;
    const { token } = req.params;

    if (!pin || !confirmPin || !token) {
        return sendResponse(res, 400, 'PIN, confirm pin, and token cannot be empty', false, null);
    }

    // Verifikasi token
    try {
        const decoded = jwt.verify(token, jwtSecret);
        console.log('Decoded token:', decoded);
        
        const { email, account_no, username } = decoded;

        // Log data yang diambil dari database
        const tempRegist = await getTempRegistByAccountNo(account_no);
        console.log('Temporary Registration Data:', tempRegist);

        if (!tempRegist || tempRegist.username !== username || tempRegist.email !== email) {
            console.log(`Mismatch: Token email (${email}) or username (${username}) not match with registered data`);
            return sendResponse(res, 404, 'Invalid token or account not found', false, null);
        }

        const pinValidation = validatePin(pin, confirmPin);
        if (!pinValidation.valid) {
            return sendResponse(res, 400, pinValidation.message, false, null);
        }

        const accountType = await getAccountType(tempRegist.account_type_id);
        if (!accountType) return sendResponse(res, 404, 'Account type not found', false, null);

        const transaction = await sequelize.transaction();

        try {
            const newCustomer = await createNewCustomer(tempRegist, transaction);
            const newAccount = await createNewAccount(tempRegist, accountType.type, newCustomer.id, pin, transaction);
            await assignRolesToCustomer(newCustomer.id, transaction);
            await TemporaryRegistration.destroy({ where: { id: tempRegist.id }, transaction });

            await transaction.commit();

            const accountDataPurpose = await getAccountWithPurpose(newAccount.no);

            return sendSuccessResponse(res, newCustomer, newAccount, accountDataPurpose);

        } catch (error) {
            await transaction.rollback();
            return handleTransactionError(res, error, 'Error during account creation');
        }

    } catch (error) {
        console.error('Token verification error:', error);
        if (error.name === 'JsonWebTokenError') {
            return sendErrResponse(res, 401, 'Invalid token', false, null);
        }
        if (error.name === 'TokenExpiredError') {
            return sendErrResponse(res, 401, 'Token expired', false, null);
        }
        return handleTransactionError(res, error, 'Error during PIN creation');
    }
};

const createNewCustomer = async (tempRegist, transaction) => {
    return await Customer.create({
        fullname: tempRegist.fullname,
        username: tempRegist.username,
        password: tempRegist.password,
        email: tempRegist.email,
        nik: tempRegist.nik,
        bornDate: tempRegist.born_date,
        address: tempRegist.address,
        ktpFile: tempRegist.ktp_document,
        photoFile: tempRegist.photo_document,
        signatureFile: tempRegist.signature_document,
        createdDate: new Date(),
        updatedDate: new Date(),
    }, { transaction });
};

const createNewAccount = async (tempRegist, accountTypeName, customerId, pin, transaction) => {
    return await Account.create({
        no: tempRegist.no_account,
        createdAt: new Date(),
        updatedAt: new Date(),
        accountTypeName,
        atm_card_no: tempRegist.atm_card,
        expDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
        createdDate: new Date(),
        updatedDate: new Date(),
        bankId: 1,
        userId: customerId,
        pin,
        accountTypeId: tempRegist.account_type_id,
        accountPurposeId: tempRegist.purpose_id,
    }, { transaction });
};

const assignRolesToCustomer = async (customerId, transaction) => {
    const roles = await Role.findAll({
        where: {
            type: 'user_role'
        }
    });

    for (const role of roles) {
        await OAuthUserRole.create({
            user_id: customerId,  
            role_id: role.id      
        }, { transaction });
    }
};

const sendSuccessResponse = (res, newCustomer, newAccount, accountDataPurpose) => {
    return res.status(200).json({
        code: 200,
        message: 'PIN successfully created, please login with your username and password',
        status: true,
        data: {
            data_customer: {
                email: newCustomer.email,
                username: newCustomer.username,
                fullname: newCustomer.fullname,
                nik: newCustomer.nik,
                born_date: newCustomer.bornDate, 
                address: newCustomer.address,
            },
            data_account: {
                account_no: newAccount.no,
                atm_card_no: newAccount.atm_card_no,
                accountTypeId: newAccount.accountTypeId,
                accountTypeCode: newAccount.accountTypeCode,
                accountTypeName: newAccount.accountTypeName,
                account_purpose_id: accountDataPurpose.accountPurpose.id,
                account_purpose: accountDataPurpose.accountPurpose.type,
                pin: newAccount.pin,
            },
            document: {
                ktp_url: newCustomer.ktpFile,
                photo_url: newCustomer.photoFile,
                signature_url: newCustomer.signatureFile,
            },
        }
    });
};
