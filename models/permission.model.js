import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const DEFAULT_PERMISSIONS = Object.freeze([
  {
    name: 'dashboard',
    read: true,
    write: false,
    delete: false,
  },
  {
    name: 'users',
    read: true,
    write: true,
    delete: false,
  },
  {
    name: 'roles',
    read: true,
    write: true,
    delete: false,
  },
  {
    name: 'roleModules',
    read: true,
    write: true,
    delete: false,
  },
  {
    name: 'permissions',
    read: true,
    write: true,
    delete: false,
  },
  {
    name: 'products',
    read: true,
    write: true,
    delete: true,
  },
  {
    name: 'orders',
    read: true,
    write: true,
    delete: false,
  },
]);

const Permission = sequelize.define(
  'Permission',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    write: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    delete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'permissions',
    timestamps: true,
    underscored: true,
  }
);

export default Permission;
