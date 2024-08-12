import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";

const Bank = sequelize.define('bank', {
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
        allowNull: false,
        field: 'deleted_date'
    },
    updatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_date'
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'bank_name'
    },
    adminFee: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: 'admin_fee'
    }
}, {
    tableName: 'bank',
    timestamps: false
});

export default Bank;