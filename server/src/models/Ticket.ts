import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface TicketAttributes {
  id: string;
  booking_id: string;
  ticket_number: string;
  pnr: string;
  e_ticket_url?: string;
  qr_code?: string;
  delivery_status: 'pending' | 'sent' | 'confirmed';
  sent_via?: 'whatsapp' | 'email';
  sent_at?: Date;
  confirmed_at?: Date;
  created_at?: Date;
}

interface TicketCreationAttributes extends Optional<TicketAttributes, 'id' | 'delivery_status' | 'created_at'> {}

export class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
  public id!: string;
  public booking_id!: string;
  public ticket_number!: string;
  public pnr!: string;
  public e_ticket_url?: string;
  public qr_code?: string;
  public delivery_status!: 'pending' | 'sent' | 'confirmed';
  public sent_via?: 'whatsapp' | 'email';
  public sent_at?: Date;
  public confirmed_at?: Date;
  
  public readonly created_at!: Date;
}

Ticket.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  booking_id: { type: DataTypes.UUID, allowNull: false },
  ticket_number: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  pnr: { type: DataTypes.STRING(10), allowNull: false },
  e_ticket_url: { type: DataTypes.STRING(255) },
  qr_code: { type: DataTypes.TEXT },
  delivery_status: { type: DataTypes.ENUM('pending', 'sent', 'confirmed'), defaultValue: 'pending' },
  sent_via: { type: DataTypes.ENUM('whatsapp', 'email') },
  sent_at: { type: DataTypes.DATE },
  confirmed_at: { type: DataTypes.DATE },
}, {
  sequelize,
  tableName: 'tickets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});
