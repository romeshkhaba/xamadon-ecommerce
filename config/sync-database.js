import { DataTypes, QueryTypes } from 'sequelize';
import sequelize from './database.js';
import Permission, { DEFAULT_PERMISSIONS } from '../models/permission.model.js';
import Role from '../models/role.model.js';
import RoleModule from '../models/role-module.model.js';

// ---------------------------------------------------------------------------
// Migration tracker — each named migration runs exactly once, ever.
// ---------------------------------------------------------------------------

async function ensureMigrationsTable(queryInterface) {
  const table = await queryInterface.describeTable('_schema_migrations').catch(() => null);

  if (table) return;

  await queryInterface.createTable('_schema_migrations', {
    name: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    ran_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
}

async function hasMigrationRun(migrationName) {
  const rows = await sequelize.query(
    'SELECT 1 FROM _schema_migrations WHERE name = :name LIMIT 1',
    { replacements: { name: migrationName }, type: QueryTypes.SELECT }
  );
  return rows.length > 0;
}

async function recordMigration(queryInterface, migrationName) {
  await queryInterface.bulkInsert('_schema_migrations', [
    { name: migrationName, ran_at: new Date() },
  ]);
}

async function runOnce(queryInterface, migrationName, fn) {
  if (await hasMigrationRun(migrationName)) return;
  await fn();
  await recordMigration(queryInterface, migrationName);
}

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  const table = await queryInterface.describeTable(tableName);

  if (table[columnName]) {
    return;
  }

  await queryInterface.addColumn(tableName, columnName, definition);
}

async function changeColumnIfExists(queryInterface, tableName, columnName, definition) {
  const table = await queryInterface.describeTable(tableName);

  if (!table[columnName]) {
    return;
  }

  await queryInterface.changeColumn(tableName, columnName, definition);
}

async function removeColumnIfExists(queryInterface, tableName, columnName) {
  const table = await queryInterface.describeTable(tableName);

  if (!table[columnName]) {
    return;
  }

  await queryInterface.removeColumn(tableName, columnName);
}

async function addIndexIfMissing(queryInterface, tableName, indexName, fields, options = {}) {
  const indexes = await queryInterface.showIndex(tableName);
  const hasMatchingIndex = indexes.some((index) => {
    const indexFields = index.fields?.map((field) => field.attribute) ?? [];
    const sameFields =
      indexFields.length === fields.length &&
      fields.every((field, indexPosition) => field === indexFields[indexPosition]);

    return index.name === indexName || (sameFields && Boolean(index.unique) === Boolean(options.unique));
  });

  if (hasMatchingIndex) {
    return;
  }

  await queryInterface.addIndex(tableName, fields, {
    ...options,
    name: indexName,
  });
}

async function addIndexIfPossible(queryInterface, tableName, indexName, fields, options = {}) {
  try {
    await addIndexIfMissing(queryInterface, tableName, indexName, fields, options);
  } catch (error) {
    if (error?.original?.code === 'ER_TOO_MANY_KEYS') {
      console.warn(
        `Skipped index ${indexName} on ${tableName}: MySQL key limit reached`
      );
      return;
    }

    throw error;
  }
}

async function removeMatchingIndexes(queryInterface, tableName, fields, options = {}) {
  const indexes = await queryInterface.showIndex(tableName);

  for (const index of indexes) {
    const indexFields = index.fields?.map((field) => field.attribute) ?? [];
    const sameFields =
      indexFields.length === fields.length &&
      fields.every((field, indexPosition) => field === indexFields[indexPosition]);

    if (!sameFields || index.primary) {
      continue;
    }

    if (options.uniqueOnly && !index.unique) {
      continue;
    }

    await queryInterface.removeIndex(tableName, index.name);
  }
}

async function addForeignKeyIfMissing(
  queryInterface,
  tableName,
  columnName,
  referencedTableName,
  referencedColumnName
) {
  const foreignKeys = await queryInterface.getForeignKeyReferencesForTable(tableName);
  const hasForeignKey = foreignKeys.some((foreignKey) => {
    return (
      foreignKey.columnName === columnName &&
      foreignKey.referencedTableName === referencedTableName &&
      foreignKey.referencedColumnName === referencedColumnName
    );
  });

  if (hasForeignKey) {
    return;
  }

  await queryInterface.addConstraint(tableName, {
    fields: [columnName],
    type: 'foreign key',
    name: `${tableName}_${columnName}_fk`,
    references: {
      table: referencedTableName,
      field: referencedColumnName,
    },
  });
}

async function removeDuplicateForeignKeys(
  queryInterface,
  tableName,
  columnName,
  referencedTableName,
  referencedColumnName
) {
  const foreignKeys = await queryInterface.getForeignKeyReferencesForTable(tableName);
  const matchingForeignKeys = foreignKeys.filter((foreignKey) => {
    return (
      foreignKey.columnName === columnName &&
      foreignKey.referencedTableName === referencedTableName &&
      foreignKey.referencedColumnName === referencedColumnName
    );
  });

  for (const foreignKey of matchingForeignKeys.slice(1)) {
    await queryInterface.removeConstraint(tableName, foreignKey.constraintName);
  }
}

async function syncAddressesTable(queryInterface) {
  await addColumnIfMissing(queryInterface, 'addresses', 'userId', {
    type: DataTypes.UUID,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'addresses', 'name', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'addresses', 'phone', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'addresses', 'line1', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'addresses', 'line2', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'addresses', 'city', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'addresses', 'state', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'addresses', 'postalCode', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'addresses', 'country', {
    type: DataTypes.STRING(2),
    allowNull: false,
    defaultValue: 'US',
  });
  await addColumnIfMissing(queryInterface, 'addresses', 'isDefault', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
  await addColumnIfMissing(queryInterface, 'addresses', 'createdAt', {
    type: DataTypes.DATE,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'addresses', 'updatedAt', {
    type: DataTypes.DATE,
    allowNull: true,
  });

  await changeColumnIfExists(queryInterface, 'addresses', 'userId', {
    type: DataTypes.UUID,
    allowNull: false,
  });
  await changeColumnIfExists(queryInterface, 'addresses', 'name', {
    type: DataTypes.STRING,
    allowNull: false,
  });
  await changeColumnIfExists(queryInterface, 'addresses', 'phone', {
    type: DataTypes.STRING,
    allowNull: false,
  });
  await changeColumnIfExists(queryInterface, 'addresses', 'line1', {
    type: DataTypes.STRING,
    allowNull: false,
  });
  await changeColumnIfExists(queryInterface, 'addresses', 'line2', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await changeColumnIfExists(queryInterface, 'addresses', 'city', {
    type: DataTypes.STRING,
    allowNull: false,
  });
  await changeColumnIfExists(queryInterface, 'addresses', 'state', {
    type: DataTypes.STRING,
    allowNull: false,
  });
  await changeColumnIfExists(queryInterface, 'addresses', 'postalCode', {
    type: DataTypes.STRING,
    allowNull: false,
  });
  await changeColumnIfExists(queryInterface, 'addresses', 'country', {
    type: DataTypes.STRING(2),
    allowNull: false,
    defaultValue: 'US',
  });
  await changeColumnIfExists(queryInterface, 'addresses', 'isDefault', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
  await changeColumnIfExists(queryInterface, 'addresses', 'createdAt', {
    type: DataTypes.DATE,
    allowNull: false,
  });
  await changeColumnIfExists(queryInterface, 'addresses', 'updatedAt', {
    type: DataTypes.DATE,
    allowNull: false,
  });
}

async function syncOrdersTable(queryInterface) {
  await removeColumnIfExists(queryInterface, 'orders', 'shippingAddressId');
  await removeColumnIfExists(queryInterface, 'orders', 'shippingAddress');
  await removeColumnIfExists(queryInterface, 'orders', 'stripeClientSecret');
  await removeColumnIfExists(queryInterface, 'orders', 'stripeordeCheckoutSessionId');

  await addColumnIfMissing(queryInterface, 'orders', 'orderNumber', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'orders', 'addressId', {
    type: DataTypes.UUID,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'orders', 'paymentMethod', {
    type: DataTypes.ENUM('cod', 'stripe'),
    allowNull: false,
    defaultValue: 'cod',
  });
  await addColumnIfMissing(queryInterface, 'orders', 'stripeCheckoutSessionId', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'orders', 'stripePaymentIntentId', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'orders', 'shippingAmount', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
  await addColumnIfMissing(queryInterface, 'orders', 'taxAmount', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
  await addColumnIfMissing(queryInterface, 'orders', 'discountAmount', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
  await addColumnIfMissing(queryInterface, 'orders', 'placedAt', {
    type: DataTypes.DATE,
    allowNull: true,
  });

  await changeColumnIfExists(queryInterface, 'orders', 'orderNumber', {
    type: DataTypes.STRING,
    allowNull: false,
  });
  await changeColumnIfExists(queryInterface, 'orders', 'addressId', {
    type: DataTypes.UUID,
    allowNull: false,
  });
  await changeColumnIfExists(queryInterface, 'orders', 'status', {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  });
  await changeColumnIfExists(queryInterface, 'orders', 'paymentStatus', {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  });
  await changeColumnIfExists(queryInterface, 'orders', 'paymentMethod', {
    type: DataTypes.ENUM('cod', 'stripe'),
    allowNull: false,
    defaultValue: 'cod',
  });
  await changeColumnIfExists(queryInterface, 'orders', 'paymentProvider', {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'cod',
  });
  await changeColumnIfExists(queryInterface, 'orders', 'currency', {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'usd',
  });
  await changeColumnIfExists(queryInterface, 'orders', 'subtotal', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
  await changeColumnIfExists(queryInterface, 'orders', 'shippingAmount', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
  await changeColumnIfExists(queryInterface, 'orders', 'taxAmount', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
  await changeColumnIfExists(queryInterface, 'orders', 'discountAmount', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
  await changeColumnIfExists(queryInterface, 'orders', 'totalAmount', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
  await changeColumnIfExists(queryInterface, 'orders', 'placedAt', {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  });
  await changeColumnIfExists(queryInterface, 'orders', 'stripeCheckoutSessionId', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await changeColumnIfExists(queryInterface, 'orders', 'stripePaymentIntentId', {
    type: DataTypes.STRING,
    allowNull: true,
  });

  await removeMatchingIndexes(queryInterface, 'orders', ['stripePaymentIntentId'], {
    uniqueOnly: true,
  });
  await addIndexIfMissing(
    queryInterface,
    'orders',
    'orders_order_number_unique',
    ['orderNumber'],
    { unique: true }
  );
  await addIndexIfMissing(
    queryInterface,
    'orders',
    'orders_address_id_index',
    ['addressId']
  );
  await removeDuplicateForeignKeys(
    queryInterface,
    'orders',
    'addressId',
    'addresses',
    'id'
  );
  await addForeignKeyIfMissing(
    queryInterface,
    'orders',
    'addressId',
    'addresses',
    'id'
  );
}

async function syncProductsTable(queryInterface) {
  await addColumnIfMissing(queryInterface, 'products', 'isHero', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
}

async function syncRolesTable(queryInterface) {
  await removeColumnIfExists(queryInterface, 'roles', 'description');
  await removeColumnIfExists(queryInterface, 'roles', 'permissions');
}

async function syncRoleModulesTable(queryInterface) {
  await addColumnIfMissing(queryInterface, 'role_modules', 'role_id', {
    type: DataTypes.UUID,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'role_modules', 'permission_id', {
    type: DataTypes.UUID,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'role_modules', 'name', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'role_modules', 'read', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  });
  await addColumnIfMissing(queryInterface, 'role_modules', 'write', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
  await addColumnIfMissing(queryInterface, 'role_modules', 'delete', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
  await addColumnIfMissing(queryInterface, 'role_modules', 'is_active', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  });

  await removeColumnIfExists(queryInterface, 'role_modules', 'key');
  await removeColumnIfExists(queryInterface, 'role_modules', 'description');

  await changeColumnIfExists(queryInterface, 'role_modules', 'name', {
    type: DataTypes.STRING,
    allowNull: false,
  });
  await removeMatchingIndexes(queryInterface, 'role_modules', ['name'], {
    uniqueOnly: true,
  });
  await addIndexIfPossible(
    queryInterface,
    'role_modules',
    'role_modules_role_id_name_unique',
    ['role_id', 'name'],
    { unique: true }
  );
  await addIndexIfPossible(
    queryInterface,
    'role_modules',
    'role_modules_role_id_permission_id_unique',
    ['role_id', 'permission_id'],
    { unique: true }
  );
}

async function syncPermissionsTable(queryInterface) {
  await addColumnIfMissing(queryInterface, 'permissions', 'name', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'permissions', 'read', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  });
  await addColumnIfMissing(queryInterface, 'permissions', 'write', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
  await addColumnIfMissing(queryInterface, 'permissions', 'delete', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
  await addColumnIfMissing(queryInterface, 'permissions', 'is_active', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  });

  await changeColumnIfExists(queryInterface, 'permissions', 'name', {
    type: DataTypes.STRING,
    allowNull: false,
  });
  await addIndexIfPossible(
    queryInterface,
    'permissions',
    'permissions_name_unique',
    ['name'],
    { unique: true }
  );
}

async function seedDefaultPermissions() {
  for (const permissionData of DEFAULT_PERMISSIONS) {
    const [permission, created] = await Permission.findOrCreate({
      where: {
        name: permissionData.name,
      },
      defaults: {
        ...permissionData,
        isActive: true,
      },
    });

    if (!created && permission.isActive === false) {
      await permission.update({ isActive: true });
    }
  }
}

async function backfillRoleModulesFromPermissions() {
  const roles = await Role.findAll({
    where: {
      isActive: true,
    },
  });
  const permissions = await Permission.findAll({
    where: {
      isActive: true,
    },
  });

  for (const role of roles) {
    for (const permission of permissions) {
      const existingRoleModule = await RoleModule.findOne({
        where: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });

      if (existingRoleModule) {
        continue;
      }

      const existingRoleModuleByName = await RoleModule.findOne({
        where: {
          roleId: role.id,
          name: permission.name,
        },
      });

      if (existingRoleModuleByName) {
        if (!existingRoleModuleByName.permissionId) {
          await existingRoleModuleByName.update({ permissionId: permission.id });
        }

        continue;
      }

      await RoleModule.create({
        roleId: role.id,
        permissionId: permission.id,
        name: permission.name,
        read: permission.read,
        write: permission.write,
        delete: permission.delete,
        isActive: permission.isActive,
      });
    }
  }
}

export default async function syncDatabase() {
  await sequelize.sync();

  const queryInterface = sequelize.getQueryInterface();

  await ensureMigrationsTable(queryInterface);

  await runOnce(queryInterface, '001_users_add_admin_role_columns', async () => {
    await addColumnIfMissing(queryInterface, 'users', 'is_admin', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await addColumnIfMissing(queryInterface, 'users', 'role_id', {
      type: DataTypes.UUID,
      allowNull: true,
    });
  });

  await runOnce(queryInterface, '002_users_add_password_reset_columns', async () => {
    await addColumnIfMissing(queryInterface, 'users', 'reset_password_token', {
      type: DataTypes.STRING,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'users', 'reset_password_expires_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
  });

  await runOnce(queryInterface, '003_users_add_2fa_columns', async () => {
    await addColumnIfMissing(queryInterface, 'users', 'two_factor_otp_token', {
      type: DataTypes.STRING,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, 'users', 'two_factor_otp_expires_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });
  });

  await runOnce(queryInterface, '004_sync_roles_table', () => syncRolesTable(queryInterface));
  await runOnce(queryInterface, '005_sync_permissions_table', () => syncPermissionsTable(queryInterface));
  await runOnce(queryInterface, '006_sync_role_modules_table', () => syncRoleModulesTable(queryInterface));
  await runOnce(queryInterface, '007_seed_default_permissions', () => seedDefaultPermissions());
  await runOnce(queryInterface, '008_backfill_role_modules', () => backfillRoleModulesFromPermissions());
  await runOnce(queryInterface, '009_sync_products_table', () => syncProductsTable(queryInterface));
  await runOnce(queryInterface, '010_sync_addresses_table', () => syncAddressesTable(queryInterface));
  await runOnce(queryInterface, '011_sync_orders_table', () => syncOrdersTable(queryInterface));
}
