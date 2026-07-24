"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUser = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class AdminUser extends sequelize_1.Model {
}
exports.AdminUser = AdminUser;
AdminUser.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: { type: sequelize_1.DataTypes.STRING(255), unique: true, allowNull: false },
    password_hash: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    full_name: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    role: { type: sequelize_1.DataTypes.ENUM('admin', 'super_admin'), defaultValue: 'admin' },
    last_login: { type: sequelize_1.DataTypes.DATE },
}, {
    sequelize: database_1.default,
    tableName: 'admin_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
