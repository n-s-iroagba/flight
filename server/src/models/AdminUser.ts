import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface AdminUserAttributes {
  id: string;
  username: string;
  email?: string | null;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'super_admin';
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface AdminUserCreationAttributes extends Optional<AdminUserAttributes, 'id' | 'role' | 'created_at' | 'updated_at' | 'email'> {}

export class AdminUser extends Model<AdminUserAttributes, AdminUserCreationAttributes> implements AdminUserAttributes {
  public id!: string;
  public username!: string;
  public email?: string | null;
  public password_hash!: string;
  public full_name!: string;
  public role!: 'admin' | 'super_admin';
  public last_login?: Date;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AdminUser.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  email: { type: DataTypes.STRING(255), unique: true, allowNull: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  full_name: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'super_admin'), defaultValue: 'admin' },
  last_login: { type: DataTypes.DATE },
}, {
  sequelize,
  tableName: 'admin_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});
