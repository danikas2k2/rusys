import type { Db } from 'mongodb';

import type { Group, Product, Variant } from '~/common/data';

export type Scenario = 'empty' | 'basic' | 'annual' | 'review' | 'history' | 'images';

export const currentYear = new Date().getFullYear() % 100;

function harvestUpdateTime(): number {
    const now = new Date();
    const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    return new Date(year, 8, 15, 12).getTime();
}

export async function seedScenario(db: Db, scenario: Scenario): Promise<void> {
    await db.dropDatabase();
    if (scenario === 'empty') {
        return;
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
            ...(scenario === 'history'
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
            name: 'Agurkai',
            years: [{ year: currentYear, amounts: [{ variant: 'Kilogramas', amount: 1 }] }],
        },
    ];

    if (scenario === 'annual') {
        products[0]!.years = [
            { year: currentYear - 1, amounts: [{ variant: 'Stiklainis', amount: 2 }] },
            { year: currentYear, amounts: [{ variant: 'Stiklainis', amount: 3 }] },
        ];
    }
    if (scenario === 'review') {
        products[0]!.missing = true;
    }

    await Promise.all([
        db.collection<Group>('groups').insertMany(groups),
        db.collection<Variant>('variants').insertMany(variants),
        db.collection<Product>('products').insertMany(products),
    ]);
}
