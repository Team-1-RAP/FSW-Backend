import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import Customer from "../../models/Customers.js";
import Account from '../../models/Accounts.js';
import AccountPurpose from '../../models/AccountPurpose.js';
import OAuthUserRole from '../../models/OAuthUserRole.js';
import Role from '../../models/Roles.js';
import AccountTypes from '../../models/AccountTypes.js';
import sequelize from '../../config/config.js';
import { validatePin } from "../../utils/validationUtils.js";
import { sendResponse } from '../../helpers/responseHelper.js';

const getTemporaryRegistration = async (username) => {
    return await TemporaryRegistration.findOne({ where: { username } });
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
    return res.status(500).json({
        code: 500,
        message: 'Internal Server Error',
        error: error.message || 'An unknown error occurred',
        data: null,
    });
};

export const createPin = async (req, res) => {
    const { pin, confirmPin } = req.body;
    const { username } = req.params;

    if (!username || !pin || !confirmPin) {
        return sendResponse(res, 400, 'Username, PIN, and confirm pin cannot be empty', false, null);
    }

    try {
        const tempRegist = await getTemporaryRegistration(username);
        if (!tempRegist) return sendResponse(res, 404, 'Username not found', false, null );

        if (tempRegist.step < 5) {
            return sendResponse(res, 400, 'Previous steps not completed', false, null);
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
    const rolesToAssign = ['ROLE_USER', 'ROLE_READ', 'ROLE_WRITE']; 

    const roles = await Role.findAll({
        where: { name: rolesToAssign }
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
        message: 'Pin success created, please login with your username and password',
        status: true,
        data: {
            data_customer: {
                email: newCustomer.email,
                username: newCustomer.username,
                fullname: newCustomer.fullname,
                nik: newCustomer.nik,
                born_date: newCustomer.born_date, 
                address: newCustomer.address,
            },
            data_account: {
                account_no: newAccount.no,
                atm_card_no: newAccount.atm_card_no,
                accountTypeId: newAccount.accountTypeId,
                accountTypeCode: newAccount.code,
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