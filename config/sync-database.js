import { DataTypes } from 'sequelize';
import sequelize from './database.js';

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

export default async function syncDatabase() {
  await sequelize.sync();

  const queryInterface = sequelize.getQueryInterface();

  await addColumnIfMissing(queryInterface, 'users', 'is_admin', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
  await addColumnIfMissing(queryInterface, 'users', 'reset_password_token', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'users', 'reset_password_expires_at', {
    type: DataTypes.DATE,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'users', 'two_factor_otp_token', {
    type: DataTypes.STRING,
    allowNull: true,
  });
  await addColumnIfMissing(queryInterface, 'users', 'two_factor_otp_expires_at', {
    type: DataTypes.DATE,
    allowNull: true,
  });
  await syncAddressesTable(queryInterface);
  await syncOrdersTable(queryInterface);
}
