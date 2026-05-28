import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export function hasRoleModuleAccess(roleModule, action) {
  return Boolean(
    roleModule &&
      roleModule.isActive !== false &&
      ['read', 'write', 'delete'].includes(action) &&
      roleModule[action] === true
  );
}

const RoleModule = sequelize.define(
  'RoleModule',
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
    roleId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: true,
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
    tableName: 'role_modules',
    timestamps: true,
    underscored: true,
  }
);

export default RoleModule;
