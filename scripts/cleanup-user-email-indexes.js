import sequelize from '../config/database.js';

async function cleanupUserEmailIndexes() {
  try {
    await sequelize.authenticate();

    const [indexes] = await sequelize.query(`
      SELECT INDEX_NAME AS indexName
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND NON_UNIQUE = 0
      GROUP BY INDEX_NAME
      HAVING COUNT(*) = 1
        AND SUM(COLUMN_NAME = 'email') = 1
      ORDER BY INDEX_NAME
    `);

    if (indexes.length <= 1) {
      console.log(`No duplicate users.email unique indexes found. Count: ${indexes.length}`);
      return;
    }

    const [, ...duplicateIndexes] = indexes.map((index) => index.indexName);

    for (const indexName of duplicateIndexes) {
      await sequelize.query(
        `ALTER TABLE users DROP INDEX ${sequelize.getQueryInterface().quoteIdentifier(indexName)}`
      );
      console.log(`Dropped duplicate users.email index: ${indexName}`);
    }

    console.log(`Kept users.email unique index: ${indexes[0].indexName}`);
  } catch (error) {
    console.error('Failed to clean duplicate users.email indexes:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

cleanupUserEmailIndexes();
