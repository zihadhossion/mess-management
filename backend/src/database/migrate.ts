import { AppDataSource } from './data-source';

AppDataSource.initialize()
  .then(() => AppDataSource.runMigrations())
  .then(() => {
    console.log('Migrations complete.');
    return AppDataSource.destroy();
  })
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  });
