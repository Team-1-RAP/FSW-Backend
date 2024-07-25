import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';
import Customer from './customer.js';

const FlagUser = sequelize.define('flag_user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    customer_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        unique: true,
        references: {
            model: 'customer',
            key: 'id'
        }
    },
    is_card_valid: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    is_birth_valid: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    is_email_valid: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    account_no: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    otp: {
        type: DataTypes.STRING(6),
        allowNull: true,
    },
    otp_expired_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
}, {
    tableName: 'flag_user',
    timestamps: false,
});

FlagUser.belongsTo(Customer, { foreignKey: 'customer_id' });

export default FlagUser;