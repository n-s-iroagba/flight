import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface BookingAttributes {
  id: string;
  booking_reference: string;
  flight_id: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  special_requests?: string;
  source: 'admin' | 'letsfg';
  offer_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
  whatsapp_conversation?: string;
  paid_at?: Date;
  confirmed_by?: string;
  notes?: string;
  created_at?: Date;
  expires_at?: Date;
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'currency' | 'status' | 'created_at' | 'expires_at'> {}

export class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: string;
  public booking_reference!: string;
  public flight_id!: string;
  public passenger_name!: string;
  public passenger_email!: string;
  public passenger_phone!: string;
  public special_requests?: string;
  public source!: 'admin' | 'letsfg';
  public offer_id?: string;
  public amount!: number;
  public currency!: string;
  public status!: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
  public whatsapp_conversation?: string;
  public paid_at?: Date;
  public confirmed_by?: string;
  public notes?: string;
  
  public readonly created_at!: Date;
  public readonly expires_at!: Date;
}

Booking.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  booking_reference: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  flight_id: { type: DataTypes.UUID, allowNull: false },
  passenger_name: { type: DataTypes.STRING(255), allowNull: false },
  passenger_email: { type: DataTypes.STRING(255), allowNull: false },
  passenger_phone: { type: DataTypes.STRING(20), allowNull: false },
  special_requests: { type: DataTypes.TEXT },
  source: { type: DataTypes.ENUM('admin', 'letsfg'), allowNull: false },
  offer_id: { type: DataTypes.STRING(100) },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING(3), defaultValue: 'USD' },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'paid', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  whatsapp_conversation: { type: DataTypes.TEXT },
  paid_at: { type: DataTypes.DATE },
  confirmed_by: { type: DataTypes.STRING(100) },
  notes: { type: DataTypes.TEXT },
}, {
  sequelize,
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});
