import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface PaymentAttributes {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  method: 'cash' | 'bank_transfer' | 'mobile_money' | 'whatsapp';
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  confirmed_by?: string;
  confirmed_at?: Date;
  notes?: string;
  created_at?: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'currency' | 'status' | 'created_at'> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: string;
  public booking_id!: string;
  public amount!: number;
  public currency!: string;
  public method!: 'cash' | 'bank_transfer' | 'mobile_money' | 'whatsapp';
  public reference?: string;
  public status!: 'pending' | 'completed' | 'failed';
  public confirmed_by?: string;
  public confirmed_at?: Date;
  public notes?: string;
  
  public readonly created_at!: Date;
}

Payment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  booking_id: { type: DataTypes.UUID, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING(3), defaultValue: 'USD' },
  method: { type: DataTypes.ENUM('cash', 'bank_transfer', 'mobile_money', 'whatsapp'), allowNull: false },
  reference: { type: DataTypes.STRING(100) },
  status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
  confirmed_by: { type: DataTypes.STRING(100) },
  confirmed_at: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT },
}, {
  sequelize,
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});
