import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";
import Role from "./Roles.js";
import Customer from "./Customers.js";

const OAuthUserRole = sequelize.define('oauth_user_role', {
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Customer, 
            key: 'id',
        },
        field: 'user_id',
    },
    role_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Role, 
            key: 'id',
        },
        field: 'role_id',
    },
}, {
    tableName: 'oauth_role',
    timestamps: false,
});

OAuthUserRole.belongsTo(Customer, { foreignKey: 'user_id', as: 'user' });
OAuthUserRole.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

export default Role;