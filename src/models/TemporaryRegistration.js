import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";
import AccountTypes from "./AccountTypes.js";
import AccountPurposes from "./AccountPurpose.js";

const TemporaryRegistration = sequelize.define('temporary_registration', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    pin: {
        type: DataTypes.STRING(6),
        allowNull: true,
    },
    account_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    purpose_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    fullname: {
        type: DataTypes.STRING(255),
        allowNull: true,
    }, 
    nik: {
        type: DataTypes.STRING(16),
        allowNull: true,
    },
    born_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    no_account: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    atm_card: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    ktp_document: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    photo_document: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    signature_document: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    otp_code: {
        type: DataTypes.STRING(6),
        allowNull: true,
    },
    otp_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
    },
    otp_expired_date: {
        type: DataTypes.DATE,
        allowNull: true,
    }
},{
    tableName: 'temporary_registrations',
    timestamps: false,
});

TemporaryRegistration.belongsTo(AccountTypes, { foreignKey: 'account_type_id', as: 'accountType' });

TemporaryRegistration.belongsTo(AccountPurposes, { foreignKey: 'purpose_id', as: 'purpose' });

export default TemporaryRegistration;