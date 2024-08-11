import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";
import Bank from "./bank.js";

const AccountNonBca = sequelize.define('AccountNonBca', {
    no_non_bca: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    deleted_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updated_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    account_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    balance: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    atm_card_no: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    exp_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    bank_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'bank', 
            key: 'id',
    },
  },
}, {
    tableName: 'account_non_bca',
    timestamps: false,
});

AccountNonBca.belongsTo(Bank, { foreignKey: 'bank_id', targetKey: 'id' });

export default AccountNonBca;