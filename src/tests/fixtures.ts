import { type Profile } from '~/state/profile/types';
import { type Details, type Group, type Summary, type Variant } from '~/types/data';

export const getGroupsFixture = (): Group[] => [
    { group: 'Daržovės', order: 2 },
    { group: 'Uogienės', order: 1 },
];

export const getVariantsFixture = (): Variant[] => [
    { group: 'Uogienės', variant: 'p', order: 0, long: '500 ml.' },
    { group: 'Uogienės', variant: 'd', order: 1, long: '750 ml.', short: 'D.' },
    { group: 'Uogienės', variant: 'm', order: 2, long: '250 ml.', short: 'M.' },
    { group: 'Uogienės', variant: 'e', order: 3, short: 'E.' },
    { group: 'Uogienės', variant: 'x', order: 4, short: 'B.' },
    { group: 'Daržovės', variant: 'd', order: 0, long: '3 l.' },
    { group: 'Daržovės', variant: 'p', order: 1, long: '2 l.' },
    { group: 'Daržovės', variant: 'm', order: 2, long: '1.5 l.' },
    { group: 'Daržovės', variant: '1', order: 3, long: '1 l.' },
    { group: 'Daržovės', variant: 'x', order: 4, short: 'B.' },
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

export const getDetailsFixture = (): Details[] => [
    {
        group: 'Uogienės',
        name: 'Avietės',
        years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
        updates: [
            {
                time: Date.parse('2022-01-01T12:00:00.000Z'),
                years: [
                    { year: 20, amounts: [{ variant: 'p', amount: -2 }] },
                    { year: 21, amounts: [{ variant: 'p', amount: -1 }] },
                ],
            },
            {
                time: Date.parse('2023-01-01T12:00:00.000Z'),
                years: [
                    { year: 21, amounts: [{ variant: 'p', amount: 2 }] },
                    { year: 22, amounts: [{ variant: 'p', amount: 1 }] },
                ],
            },
            {
                time: Date.parse('2023-01-05T12:00:00.000Z'),
                years: [{ year: 22, amounts: [{ variant: 'p', amount: -1 }] }],
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
                            { variant: 'p', amount: -1 },
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
                years: [{ year: 22, amounts: [{ variant: 'd', amount: 2 }] }],
            },
            {
                time: Date.parse('2023-02-07T12:00:00.000Z'),
                years: [{ year: 22, amounts: [{ variant: 'd', amount: -1 }] }],
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
