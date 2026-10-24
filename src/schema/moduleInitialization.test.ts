import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const runNode = promisify(execFile);
const projectRoot = path.resolve(import.meta.dirname, '../..');

describe('schema module initialization', () => {
    it.each([
        {
            entry: 'names',
            schema: 'validGroupName',
            input: ' A ',
            expected: 'A',
            invalid: 'bad:name',
        },
        {
            entry: 'groups',
            schema: 'groupIdentitySchema',
            input: { group: ' A ' },
            expected: { group: 'A' },
            invalid: { group: '' },
        },
        {
            entry: 'variants',
            schema: 'variantIdentitySchema',
            input: { group: ' A ', variant: ' v ' },
            expected: { group: 'A', variant: 'v' },
            invalid: { group: 'A', variant: 'bad:name' },
        },
        {
            entry: 'products',
            schema: 'productSchema',
            input: { group: ' A ', name: ' P ', parent: '' },
            expected: { group: 'A', name: 'P', parent: '' },
            invalid: { group: 'A', name: 'bad:name' },
        },
        {
            entry: 'amounts',
            schema: 'productAmountsSchema',
            input: { group: ' A ', name: ' P ', year: 0 },
            expected: { group: 'A', name: 'P', year: 0 },
            invalid: { group: 'A', name: 'bad:name', year: 0 },
        },
        {
            entry: 'archive',
            schema: 'exportArchiveDataSchema',
            input: { products: [{ group: ' A ', name: ' P ' }], groups: [], variants: [] },
            expected: { products: [{ group: 'A', name: 'P' }], groups: [], variants: [] },
            invalid: { products: [{ group: 'A', name: 'bad:name' }], groups: [], variants: [] },
        },
        {
            entry: 'index',
            schema: 'productSchema',
            input: { group: ' A ', name: ' P ' },
            expected: { group: 'A', name: 'P' },
            invalid: { group: 'A', name: '' },
        },
    ])(
        'imports and parses through $entry in a fresh native module graph',
        async ({ entry, schema, input, expected, invalid }) => {
            const script = `
            import assert from 'node:assert/strict';
            const schemas = await import('./src/schema/${entry}.ts');
            const schema = (schemas.default ?? schemas)[${JSON.stringify(schema)}];
            assert.deepEqual(schema.parse(${JSON.stringify(input)}), ${JSON.stringify(expected)});
            assert.equal(schema.safeParse(${JSON.stringify(invalid)}).success, false);
            process.stdout.write('parsed');
        `;
            const { stdout } = await runNode(
                process.execPath,
                ['--import', 'tsx', '--input-type=module', '--eval', script],
                {
                    cwd: projectRoot,
                    env: { ...process.env, TSX_TSCONFIG_PATH: path.join(projectRoot, 'tsconfig.json') },
                    timeout: 10_000,
                }
            );

            expect(stdout).toBe('parsed');
        }
    );
});
