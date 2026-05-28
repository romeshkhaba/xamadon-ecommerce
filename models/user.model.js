import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
      set(value) {
        this.setDataValue('email', value.trim().toLowerCase());
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    twoFactorOtpToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    twoFactorOtpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true
  }
);

export default User;
