import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";
import Customer from "./customer.js";
import Bank from "./bank.js";

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
    accountType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'account_type'
    },
    balance: {
        type: DataTypes.FLOAT,
        allowNull: false,
        field: 'balance'
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
        field: 'bank_id'
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'user_id'
    },
    pin: {
        type: DataTypes.STRING(6),
        allowNull: true,
        field: 'pin'
    }
}, {
    tableName: 'account',
    timestamps: false,
});

Account.belongsTo(Customer, {foreignKey: 'userId', onDelete: 'CASCADE'});
Account.belongsTo(Bank, {foreignKey: 'bankId', onDelete: 'CASCADE'});

export default Account;