import type { Profile } from '~/client/state/profile/types';
import type { Group, Product, Summary, Variant } from '~/types/data';

export const getGroupsFixture = (): Group[] => [
    { group: 'Daržovės', order: 2 },
    { group: 'Uogienės', order: 1, annual: true },
];

export const getVariantsFixture = (): Variant[] => [
    { group: 'Uogienės', variant: 'p', order: 0 },
    { group: 'Uogienės', variant: 'd', order: 1, suffix: 'D.' },
    { group: 'Uogienės', variant: 'm', order: 2, suffix: 'M.' },
    { group: 'Uogienės', variant: 'e', order: 3, suffix: 'E.' },
    { group: 'Uogienės', variant: 'x', order: 4, suffix: 'B.' },
    { group: 'Daržovės', variant: 'd', order: 0 },
    { group: 'Daržovės', variant: 'p', order: 1 },
    { group: 'Daržovės', variant: 'm', order: 2 },
    { group: 'Daržovės', variant: '1', order: 3 },
    { group: 'Daržovės', variant: 'x', order: 4, suffix: 'B.' },
];

export const getAggregatedVariantsFixture = (): Variant[] => {
    const variants = getVariantsFixture();
    return variants
        .map((v) => ({
            ...v,
            used:
                v.variant === 'p' ||
                (v.variant === 'd' && v.group === 'Daržovės') ||
                (v.variant === 'm' && v.group === 'Uogienės'),
        }))
        .sort((a, b) => a.group.localeCompare(b.group) || a.order - b.order);
};

export const getProductsFixture = (): Product[] => [
    {
        group: 'Uogienės',
        name: 'Avietės',
        years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
        updates: [
            {
                time: Date.parse('2022-01-01T12:00:00.000Z'),
                years: [
                    { year: 20, amounts: [{ variant: 'p', amount: -2, recycled: false }] },
                    { year: 21, amounts: [{ variant: 'p', amount: -1, recycled: false }] },
                ],
            },
            {
                time: Date.parse('2023-01-01T12:00:00.000Z'),
                years: [
                    { year: 21, amounts: [{ variant: 'p', amount: 2, recycled: false }] },
                    { year: 22, amounts: [{ variant: 'p', amount: 1, recycled: false }] },
                ],
            },
            {
                time: Date.parse('2023-01-05T12:00:00.000Z'),
                years: [{ year: 22, amounts: [{ variant: 'p', amount: -1, recycled: false }] }],
            },
        ],
    },
    {
        group: 'Uogienės',
        name: 'Braškės',
        years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
        missing: true,
        updates: [
            {
                time: Date.parse('2022-01-15T12:00:00.000Z'),
                years: [{ year: 21, amounts: [{ variant: 'p', amount: -1, recycled: true }] }],
            },
            {
                time: Date.parse('2023-02-01T12:00:00.000Z'),
                years: [
                    { year: 22, amounts: [{ variant: 'p', amount: 2, recycled: true }] },
                    { year: 22, amounts: [{ variant: 'm', amount: -1, recycled: true }] },
                ],
            },
            {
                time: Date.parse('2023-02-05T12:00:00.000Z'),
                years: [
                    {
                        year: 22,
                        amounts: [
                            { variant: 'p', amount: -1, recycled: false },
                            { variant: 'm', amount: -2, recycled: true },
                        ],
                    },
                ],
            },
        ],
    },
    {
        group: 'Daržovės',
        name: 'Agurkai',
        years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }],
        updates: [
            {
                time: Date.parse('2023-02-03T12:00:00.000Z'),
                years: [{ year: 22, amounts: [{ variant: 'd', amount: 2, recycled: false }] }],
            },
            {
                time: Date.parse('2023-02-07T12:00:00.000Z'),
                years: [{ year: 22, amounts: [{ variant: 'd', amount: -1, recycled: false }] }],
            },
        ],
    },
    {
        group: 'Daržovės',
        name: 'Kopūstai',
        years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
    },
];

export const getSummaryFixture = (): Summary[] => [
    { group: 'Uogienės', name: 'Avietės', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }] },
    {
        group: 'Uogienės',
        name: 'Braškės',
        years: [
            {
                year: 22,
                amounts: [{ variant: 'd', amount: 1 }],
            },
        ],
    },
    { group: 'Daržovės', name: 'Agurkai', years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }] },
    { group: 'Daržovės', name: 'Kopūstai', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }] },
];

export const getYearsFixture = (): number[] => [23, 22, 21];

export function getProfileFixture(): Profile {
    return {
        name: 'Big Buddy',
        email: 'big.buddy@email.com',
    };
}
