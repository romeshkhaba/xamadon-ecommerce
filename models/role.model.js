import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Role = sequelize.define(
  'Role',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'roles',
    timestamps: true,
    underscored: true,
  }
);

export default Role;
