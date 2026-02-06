import { runMigrations } from './config/db';

async function main() {
    console.log('Starting standalone migration...');
    await runMigrations();
    console.log('Migration finished.');
    process.exit(0);
}

main().catch(err => {
    console.error('Standalone migration failed:', err);
    process.exit(1);
});
