import 'dotenv/config';
import ds from '../src/data-source';

async function run() {
  await ds.initialize();
  const schema = 'public';

  try {
    await ds.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await ds.query(`CREATE SCHEMA "${schema}"`);
  } catch (e) {
    console.error('Drop/create schema failed:', e);
    await ds.destroy();
    process.exit(1);
  }

  try {
    const executed = await ds.runMigrations();
    console.log(`Ran ${executed.length} migration(s).`);
  } catch (e) {
    console.error('Migrations failed:', e);
    await ds.destroy();
    process.exit(1);
  }

  await ds.destroy();
  console.log('Migration:fresh done.');
}

run();
