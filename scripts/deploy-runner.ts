import { deploy, rollback } from './deploy';

const task = process.argv[2];
const plugin = task === 'rollback' ? rollback() : deploy();

plugin.closeBundle().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});
