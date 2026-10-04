import { copyFile } from 'node:fs/promises';
import path from 'node:path';

import type { Db } from 'mongodb';

import type { Group, Product, Variant } from '~/common/data';

export type Scenario =
    'empty' | 'basic' | 'annual' | 'review' | 'history' | 'images' | 'history-images' | 'consumed-recycled';

export const currentYear = new Date().getFullYear() % 100;

function harvestUpdateTime(): number {
    const now = new Date();
    const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    return new Date(year, 8, 15, 12).getTime();
}

export function createScenarioData(scenario: Scenario): { groups: Group[]; variants: Variant[]; products: Product[] } {
    if (scenario === 'empty') {
        return { groups: [], variants: [], products: [] };
    }

    const groups: Group[] = [
        { group: 'Uogienės', order: 0, annual: true, review: scenario === 'review' },
        { group: 'Daržovės', order: 1, annual: false, review: scenario === 'review' },
    ];
    const variants: Variant[] = [
        { group: 'Uogienės', variant: 'Stiklainis', order: 0, count: 1, units: 'vnt' },
        { group: 'Uogienės', variant: 'Didelis indelis', order: 1, count: 1, units: 'vnt' },
        { group: 'Daržovės', variant: 'Kilogramas', order: 0, count: 1, units: 'kg' },
    ];
    const products: Product[] = [
        {
            group: 'Uogienės',
            name: 'Avietės',
            years: [{ year: currentYear, amounts: [{ variant: 'Stiklainis', amount: 3 }] }],
            ...(scenario === 'history' || scenario === 'history-images'
                ? {
                      updates: [
                          {
                              time: harvestUpdateTime(),
                              comment: 'Suvalgyta su arbata',
                              years: [
                                  {
                                      year: currentYear,
                                      amounts: [{ variant: 'Stiklainis', amount: -1, recycled: false }],
                                  },
                              ],
                          },
                      ],
                  }
                : {}),
        },
        { group: 'Uogienės', name: 'Braškės', years: [{ year: currentYear, amounts: [] }] },
        {
            group: 'Daržovės',
            name: 'Morkos',
            years: [{ year: currentYear, amounts: [{ variant: 'Kilogramas', amount: 1 }] }],
        },
    ];

    if (scenario === 'images' || scenario === 'history-images') {
        const images = [
            { file: 'uogienes.png', target: groups[0]! },
            { file: 'darzoves.png', target: groups[1]! },
            { file: 'avietes.png', target: products[0]! },
            { file: 'braskes.png', target: products[1]! },
            { file: 'morkos.png', target: products[2]! },
        ];
        for (const { file, target } of images) {
            target.image = `/images/${file}`;
        }
    }

    if (scenario === 'annual') {
        products[0]!.years = [
            { year: currentYear - 1, amounts: [{ variant: 'Stiklainis', amount: 2 }] },
            { year: currentYear, amounts: [{ variant: 'Stiklainis', amount: 3 }] },
        ];
    }
    if (scenario === 'review') {
        products[0]!.missing = true;
    }

    return { groups, variants, products };
}

export async function seedScenario(db: Db, scenario: Scenario, imagesDir: string): Promise<void> {
    await db.dropDatabase();
    if (scenario === 'empty') {
        return;
    }

    const { groups, variants, products } = createScenarioData(scenario);
    if (scenario === 'images' || scenario === 'history-images') {
        await Promise.all(
            [...groups, ...products]
                .filter((item) => item.image)
                .map((item) => {
                    const file = path.basename(item.image!);
                    return copyFile(path.resolve(process.cwd(), 'assets', file), path.join(imagesDir, file));
                })
        );
    }

    await Promise.all([
        db.collection<Group>('groups').insertMany(groups),
        db.collection<Variant>('variants').insertMany(variants),
        db.collection<Product>('products').insertMany(products),
    ]);
}
