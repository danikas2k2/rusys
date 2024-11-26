import moment from 'moment';
import { type ClientSession } from 'mongodb';
import {
    type Details,
    type Group,
    type Summary,
    type Variant,
    type VariantAmount,
    type YearAmounts,
} from '~/common/types';
import { getGroups } from '~/server/data/groups';
import { hasEffect } from '~/server/data/utils';
import { getVariants } from '~/server/data/variants';
import { getYears } from '~/server/data/years';
import { getDetailsCollection } from '~/server/db';

const startMonth = 9; // September

function getYearFromTime(time: number): number {
    const t = moment(time);
    return +t.format('YY') - +(+t.format('M') < startMonth);
}

export async function getSummary(
    years: number[] = getYears(),
    session?: ClientSession
): Promise<ReadonlyArray<Summary>> {
    const fromYear = 2000 + Math.min(...years);
    const from = moment(`${fromYear}-0${startMonth}-01`).valueOf();
    const col = await getDetailsCollection();

    const details = await col
        .aggregate<Details>(
            [
                {
                    $match: {
                        'updates.time': { $gte: from },
                        'updates.years.amounts.amount': { $lt: 0 },
                    },
                },
                {
                    $project: {
                        group: 1,
                        name: 1,
                        updates: {
                            $filter: {
                                input: '$updates',
                                as: 'update',
                                cond: {
                                    $and: [
                                        { $gte: ['$$update.time', from] },
                                        // { $ne: ['$$update.years.recycled', !recycled] },
                                    ],
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        group: 1,
                        name: 1,
                        updates: {
                            $map: {
                                input: '$updates',
                                as: 'update',
                                in: {
                                    time: '$$update.time',
                                    years: {
                                        $map: {
                                            input: '$$update.years',
                                            as: 'year',
                                            in: {
                                                year: '$$year.year',
                                                amounts: {
                                                    $filter: {
                                                        input: '$$year.amounts',
                                                        as: 'variant',
                                                        cond: { $lt: ['$$variant.amount', 0] },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    $sort: { group: 1, name: 1, 'updates.time': 1, 'updates.years.year': 1 },
                },
            ],
            { session }
        )
        .toArray();

    let summary: ReadonlyArray<Summary> = [];
    for (const { group = '', name = '', updates } of details) {
        for (const { time, years: updateYears } of updates || []) {
            const year = getYearFromTime(time);
            for (const { amounts } of updateYears) {
                for (const { variant, amount, recycled } of amounts) {
                    const item = { variant, amount: -amount, ...(recycled ? { recycled } : {}) };
                    summary = summary.some((v) => v.group === group && v.name === name)
                        ? summary.map((v) =>
                              v.group !== group || v.name !== name
                                  ? v
                                  : {
                                        ...v,
                                        years: v.years?.some((y) => y.year === year)
                                            ? v.years?.map((y) =>
                                                  y.year !== year
                                                      ? y
                                                      : {
                                                            ...y,
                                                            amounts: y.amounts?.some((a) => a.variant === variant)
                                                                ? y.amounts.map((a) =>
                                                                      a.variant !== variant
                                                                          ? a
                                                                          : { ...a, amount: a.amount - amount }
                                                                  )
                                                                : [...(y.amounts ?? []), item],
                                                        }
                                              )
                                            : [...(v.years ?? []), { year, amounts: [item] }],
                                    }
                          )
                        : [...summary, { group, name, years: [{ year, amounts: [item] }] }];
                }
            }
        }
    }
    return summary;
}

export async function addUpdates(
    group: string,
    name: string,
    years?: ReadonlyArray<YearAmounts>,
    session?: ClientSession
): Promise<boolean> {
    return years?.length
        ? (await getDetailsCollection())
              .updateOne(
                  { group, name },
                  { $push: { updates: { time: Date.now(), years } } },
                  { upsert: true, session }
              )
              .then(hasEffect)
        : false;
}

export async function addUpdate(
    group: string,
    name: string,
    year: number,
    amounts: ReadonlyArray<VariantAmount> = [],
    session?: ClientSession
): Promise<boolean> {
    if (!group || !name || !year || !amounts.length) {
        return false;
    }
    return (await getDetailsCollection())
        .updateOne(
            { group, name },
            { $push: { updates: { time: Date.now(), years: [{ year, amounts }] } } },
            { upsert: true, session }
        )
        .then(hasEffect);
}

export const getFullSummary = async (): Promise<
    Readonly<{
        years: ReadonlyArray<number>;
        groups: ReadonlyArray<Group>;
        variants: ReadonlyArray<Variant>;
        summary: ReadonlyArray<Summary>;
    }>
> => {
    const years = getYears();
    return {
        years,
        groups: await getGroups(),
        variants: await getVariants(),
        summary: await getSummary(years),
    };
};
