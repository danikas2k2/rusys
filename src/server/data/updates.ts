import moment from 'moment';
import { type ClientSession, type Filter } from 'mongodb';
import { type Details, type Summary, type VariantAmount, type YearAmounts } from '~/common/types';
import { hasEffect } from '~/server/data/utils';
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
    const from = moment(`${fromYear}-0${startMonth}-01`);
    const details = await (
        await getDetailsCollection()
    )
        .aggregate(
            [
                {
                    $match: {
                        'updates.time': { $gte: from.valueOf() },
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
                                cond: { $gte: ['$$update.time', from.valueOf()] },
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
    for (const { group = '', name = '', updates = [] } of details) {
        for (const { time, years } of updates) {
            const year = getYearFromTime(time);
            for (const { amounts } of years) {
                for (const { variant, amount } of amounts) {
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
                                                                : [...(y.amounts ?? []), { variant, amount: -amount }],
                                                        }
                                              )
                                            : [...(v.years ?? []), { year, amounts: [{ variant, amount: -amount }] }],
                                    }
                          )
                        : [...summary, { group, name, years: [{ year, amounts: [{ variant, amount: -amount }] }] }];
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
    const col = await getDetailsCollection();
    const prev = await col.findOne({ group, name }, { projection: { _id: 0, years: 1 }, session });
    const diff = getDiff(prev?.years, years);
    return diff?.length
        ? col
              .updateOne(
                  { group, name },
                  { $push: { updates: { time: Date.now(), years: diff } } },
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
    const col = await getDetailsCollection();
    const prev = await col.findOne({ group, name, 'years.year': year } as Filter<Details>, {
        projection: { _id: 0, years: 1 },
        session,
    });
    const diff = getDiff(prev?.years, [{ year, amounts }]);
    return diff?.length
        ? col
              .updateOne(
                  { group, name },
                  { $push: { updates: { time: Date.now(), years: diff } } },
                  { upsert: true, session }
              )
              .then(hasEffect)
        : false;
}

export function getDiff(
    prevYears?: ReadonlyArray<YearAmounts>,
    years?: ReadonlyArray<YearAmounts>
): ReadonlyArray<YearAmounts> {
    let diff: ReadonlyArray<YearAmounts> = [];
    if (years) {
        for (const { year, amounts } of years) {
            const prev = prevYears?.find((y) => y.year === year)?.amounts ?? [];
            for (const { variant, amount } of amounts) {
                diff = collectDiff(diff, year, variant, prev.find((v) => v.variant === variant)?.amount, amount);
            }
        }
    }
    if (prevYears) {
        for (const { year, amounts } of prevYears) {
            for (const { variant, amount } of amounts) {
                if (!years?.some((y) => y.year === year && y.amounts?.some((v) => v.variant === variant))) {
                    diff = collectDiff(diff, year, variant, amount);
                }
            }
        }
    }
    return diff;
}

function collectDiff(
    diff: ReadonlyArray<YearAmounts>,
    year: number,
    variant: string,
    before?: number,
    after?: number
): ReadonlyArray<YearAmounts> {
    const d = (after ?? 0) - (before ?? 0);
    return !d
        ? diff
        : !diff.some((y) => y.year === year)
          ? [...diff, { year, amounts: [{ variant, amount: d }] }]
          : diff.map((y) =>
                y.year !== year
                    ? y
                    : {
                          ...y,
                          amounts: !y.amounts.some((v) => v.variant === variant)
                              ? [...y.amounts, { variant, amount: d }]
                              : y.amounts.map((v) => (v.variant !== variant ? v : { ...v, amount: v.amount + d })),
                      }
            );
}
