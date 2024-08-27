import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";
import Customer from "./Customers.js";
import Bank from "./Banks.js";
import AccountTypes from "./AccountTypes.js";
import AccountPurpose from "./AccountPurpose.js";

const Account = sequelize.define('account', {
    no: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        field: 'no'
    },
    createdDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_date' 
    },
    deletedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_date'
    },
    updatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_date'
    },
    accountTypeName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'account_type'
    },
    balance: {
        type: DataTypes.FLOAT,
        allowNull: false,
        field: 'balance',
        defaultValue: 50000
    },
    atm_card_no: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'atm_card_no'
    },
    expDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'exp_date'
    },
    bankId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'bank_id',
        defaultValue: 1
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'user_id'
    },
    pin: {
        type: DataTypes.STRING(6),
        allowNull: false,
        field: 'pin'
    },
    pin_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'pin_attempts',
        defaultValue: 0
    },
    accountTypeId: { 
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'account_type_id'
    },
    accountPurposeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'account_purpose_id'
    },
}, {
    tableName: 'account',
    timestamps: false,
});

Account.belongsTo(Customer, { foreignKey: 'userId', as: 'customer', onDelete: 'CASCADE' });
Account.belongsTo(Bank, {foreignKey: 'bankId', onDelete: 'CASCADE'});
Account.belongsTo(AccountTypes, { foreignKey: 'accountTypeId', as: 'accountType', onDelete: 'SET NULL' });
Account.belongsTo(AccountPurpose, { foreignKey: 'accountPurposeId', as: 'accountPurpose', onDelete: 'SET NULL' });

export default Account;