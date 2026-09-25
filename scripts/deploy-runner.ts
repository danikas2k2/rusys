import { deploy, rollback } from './deploy';

const task = process.argv[2];
const plugin = task === 'rollback' ? rollback() : deploy();

await plugin.closeBundle();
