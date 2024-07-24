import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";

const Role = sequelize.define('role', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'name'
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'type'
    }
}, {
    tableName: 'oauth_role',
    uniqueKeys: {
        role_name_and_type: { fields: ['type', 'name']}
    }
});

export default Role;