import { type Details, type Group, type Summary, type Variant } from '~/common/types';
import { type Profile } from '~/state/profile/types';

export const getTestGroups = (): Group[] => [
    { group: 'G', order: 2 },
    { group: 'J', order: 1 },
];

export const getTestVariants = (): Variant[] => [
    { group: 'J', variant: 'p', order: 0, long: '500 ml.' },
    { group: 'J', variant: 'd', order: 1, long: '750 ml.', short: 'D.' },
    { group: 'J', variant: 'm', order: 2, long: '250 ml.', short: 'M.' },
    { group: 'J', variant: 'e', order: 3, short: 'E.' },
    { group: 'J', variant: 'x', order: 4, short: 'B.' },
    { group: 'G', variant: 'd', order: 0, long: '3 l.' },
    { group: 'G', variant: 'p', order: 1, long: '2 l.' },
    { group: 'G', variant: 'm', order: 2, long: '1.5 l.' },
    { group: 'G', variant: '1', order: 3, long: '1 l.' },
    { group: 'G', variant: 'x', order: 4, short: 'B.' },
];

export const getTestDetails = (): Details[] => [
    {
        group: 'J',
        name: 'A',
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
        group: 'J',
        name: 'B',
        years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }],
        missing: true,
        updates: [
            {
                time: Date.parse('2023-02-01T12:00:00.000Z'),
                years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
            },
            {
                time: Date.parse('2023-02-05T12:00:00.000Z'),
                years: [{ year: 22, amounts: [{ variant: 'p', amount: -1 }] }],
            },
        ],
    },
    {
        group: 'G',
        name: 'A',
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
    { group: 'G', name: 'C', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }] },
];

export const getTestSummary = (): Summary[] => [
    { group: 'J', name: 'A', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }] },
    { group: 'J', name: 'B', years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }] },
    { group: 'G', name: 'A', years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }] },
    { group: 'G', name: 'C', years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }] },
];

export const getTestYears = (): number[] => [23, 22, 21];

export function getTestProfile(): Profile {
    return {
        name: 'Big Buddy',
        email: 'big.buddy@email.com',
    };
}
