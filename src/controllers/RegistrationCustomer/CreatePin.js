import TemporaryRegistration from '../../models/TemporaryRegistration.js';
import Customer from "../../models/Customers.js";
import Account from '../../models/Accounts.js';
import AccountPurpose from '../../models/AccountPurpose.js';
import OAuthUserRole from '../../models/OAuthUserRole.js';
import Role from '../../models/Roles.js';
import AccountTypes from '../../models/AccountTypes.js';
import sequelize from '../../config/config.js';
import { validatePin } from "../../utils/validationUtils.js";

export const createPin = async (req, res) => {
    const { pin, confirmPin } = req.body;
    const { username } = req.params;

    try {
        if (!username || !pin || !confirmPin) {
            return res.status(400).json({
                code: 400,
                message: 'Username, PIN, and confirm pin cannot be empty',
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
                nik: tempRegist.nik,
                bornDate: tempRegist.born_date,
                address: tempRegist.address,
                ktpFile: tempRegist.ktp_document,
                photoFile: tempRegist.photo_document,
                signatureFile: tempRegist.signature_document,
                createdDate: new Date(),
                updatedDate: new Date(),
            }, { transaction });

            const newAccount = await Account.create({
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
                pin: pin,
                accountTypeId: tempRegist.account_type_id,
                accountPurposeId: tempRegist.purpose_id,
            }, { transaction });

            await TemporaryRegistration.destroy({ where: { id: tempRegist.id }, transaction });

            const rolesToAssign = ['ROLE_USER', 'ROLE_READ', 'ROLE_WRITE']; 

            const roles = await Role.findAll({
                where: {
                    name: rolesToAssign
                }
            });

            for (const role of roles) {
                await OAuthUserRole.create({
                    user_id: newCustomer.id,
                    role_id: role.id
                }, { transaction });
            }

            await transaction.commit();

            const accountDataPurpose = await Account.findOne({
                where: { no: newAccount.no },
                include: [{ model: AccountPurpose, as: 'accountPurpose' }]
            });

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