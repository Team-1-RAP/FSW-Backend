import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";
import Role from "./Roles.js";

const Customer = sequelize.define('customer', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'id'
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
    notExpired: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'not_expired'
    },
    notLocked: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'not_locked'
    },
    bornDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'born_date'
    },
    credentialNotExpired: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'credential_not_expired'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: 'uk_dwk6cx0afu8bs9o4t536v1j5v',
        field: 'email'
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'enabled'
    },
    expiredVerifyToken: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'expired_verify_token'
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'fullname'
    },
    loginAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'login_attempts'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'password'
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: 'uk_rosd2guvs3i1agkplv5n8vu82',
        field: 'phone_number'
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: 'uk_irnrrncatp2fvw52vp45j7rlw',
        field: 'username'
    },
    verifyToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'verify_token'
    },
    nik: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'nik'
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'address'
    },
    ktpFile: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'ktp_file'
    },
    photoFile: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'photo_file'
    },
    signatureFile: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'signature_file'
    }
}, {
    tableName: 'customer',
    timestamps: false,
});

Customer.belongsToMany(Role, {through: 'oauth_user_role', foreignKey: 'user_id'});

export default Customer;