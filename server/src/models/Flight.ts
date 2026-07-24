import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface FlightAttributes {
  id: string;
  origin: string;
  destination: string;
  departure_time: Date;
  arrival_time: Date;
  airline: string;
  airline_code: string;
  flight_number: string;
  price: number;
  currency: string;
  total_seats: number;
  available_seats: number;
  aircraft?: string;
  baggage?: string;
  cancellation_policy?: string;
  cabin_class: 'economy' | 'premium_economy' | 'business' | 'first';
  status: 'active' | 'inactive' | 'sold_out';
  is_private_jet?: boolean;
  current_latitude?: number;
  current_longitude?: number;
  current_location?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface FlightCreationAttributes extends Optional<FlightAttributes, 'id' | 'currency' | 'status' | 'is_private_jet' | 'current_latitude' | 'current_longitude' | 'current_location' | 'created_at' | 'updated_at'> {}

export class Flight extends Model<FlightAttributes, FlightCreationAttributes> implements FlightAttributes {
  public id!: string;
  public origin!: string;
  public destination!: string;
  public departure_time!: Date;
  public arrival_time!: Date;
  public airline!: string;
  public airline_code!: string;
  public flight_number!: string;
  public price!: number;
  public currency!: string;
  public total_seats!: number;
  public available_seats!: number;
  public aircraft?: string;
  public baggage?: string;
  public cancellation_policy?: string;
  public cabin_class!: 'economy' | 'premium_economy' | 'business' | 'first';
  public status!: 'active' | 'inactive' | 'sold_out';
  public is_private_jet?: boolean;
  public current_latitude?: number;
  public current_longitude?: number;
  public current_location?: string;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Flight.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  origin: { type: DataTypes.STRING(3), allowNull: false },
  destination: { type: DataTypes.STRING(3), allowNull: false },
  departure_time: { type: DataTypes.DATE, allowNull: false },
  arrival_time: { type: DataTypes.DATE, allowNull: false },
  airline: { type: DataTypes.STRING(100), allowNull: false },
  airline_code: { type: DataTypes.STRING(2), allowNull: false },
  flight_number: { type: DataTypes.STRING(10), allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING(3), defaultValue: 'USD' },
  total_seats: { type: DataTypes.INTEGER, allowNull: false },
  available_seats: { type: DataTypes.INTEGER, allowNull: false },
  aircraft: { type: DataTypes.STRING(100) },
  baggage: { type: DataTypes.TEXT },
  cancellation_policy: { type: DataTypes.TEXT },
  cabin_class: {
    type: DataTypes.ENUM('economy', 'premium_economy', 'business', 'first'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'sold_out'),
    defaultValue: 'active'
  },
  is_private_jet: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  current_latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  current_longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  current_location: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'flights',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});
