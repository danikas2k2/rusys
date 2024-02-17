import _ from 'lodash';

const $array = <T, R>(value: T, path: _.PropertyPath, defaultValue: R[] = []): R[] => [
    ...(_.get(value, path) ?? defaultValue),
];

const $paths = (s: unknown | unknown[]): _.PropertyPath[] => (Array.isArray(s) ? s : [s]);

type PathObject = Record<string, unknown>;
type SetOperation = { $set: PathObject };
const $set = <T>(res: T, s: unknown): T =>
    Object.entries(s as object).reduce((r, [p, v]) => _.set(r as object, p, v) as T, res);

type Paths = _.PropertyPath | _.PropertyPath[];
type UnsetOperation = { $unset: Paths };
const $unset = <T>(res: T, s: unknown): T => $paths(s).reduce((r, p) => (_.unset(r, p), r), res);

type PushOperation = { $push: PathObject };
const $push = <T>(res: T, s: unknown): T =>
    Object.entries(s as object).reduce((r, [p, v]) => _.set(r as object, p, [...$array(r, p), v]) as T, res);

type PopOperation = { $pop: Paths };
const $pop = <T>(res: T, s: unknown): T =>
    $paths(s).reduce((r, p) => _.set(r as object, p, $array(r, p).slice(0, -1)) as T, res);

type UnshiftOperation = { $unshift: PathObject };
const $unshift = <T>(res: T, s: unknown): T =>
    Object.entries(s as object).reduce((r, [p, v]) => _.set(r as object, p, [v, ...$array(r, p)]) as T, res);

type ShiftOperation = { $shift: Paths };
const $shift = <T>(res: T, s: unknown): T =>
    $paths(s).reduce((r, p) => _.set(r as object, p, $array(r, p).slice(1)) as T, res);

type ArrayPart = number | [from: number] | [from: number, to: number];
type Indexes = ArrayPart | Record<string, ArrayPart>;
type SliceOperation = { $slice: Indexes };

function $slice<T>(res: T, s: unknown): T {
    if (typeof s === 'number' || Array.isArray(s)) {
        const [from = 0, to] = Array.isArray(s) ? s : [s, s + 1];
        return (Array.isArray(res) ? res.slice(from, to) : []) as T;
    }
    return Object.entries(s as object).reduce((r, [p, v]) => {
        const [from = 0, to] = Array.isArray(v) ? v : [v, (v as number) + 1];
        return _.set(r as object, p, $array(r, p).slice(from, to)) as T;
    }, res);
}

type RemoveOperation = { $remove: Indexes };

function $remove<T>(res: T, s: unknown): T {
    if (typeof s === 'number') {
        if (Array.isArray(res)) {
            return [...res.slice(0, s), ...res.slice(s + 1)] as T;
        }
        return _.set(res as object, s, undefined) as T;
    }
    if (Array.isArray(s)) {
        const [from = 0, count] = s;
        if (Array.isArray(res)) {
            res.splice(from, count);
            return res;
        }
        _.unset(res, from);
        return res;
    }
    return Object.entries(s as object).reduce((r, [p, v]) => {
        const [from = 0, count] = Array.isArray(v) ? v : [v, 1];
        const a = $array(r, p);
        return _.set(r as object, p, [...a.slice(0, from), ...a.slice(count)]) as T;
    }, res);
}

type MergeOperation = { $merge: unknown };
type BulkOperation =
    | SetOperation
    | UnsetOperation
    | PushOperation
    | PopOperation
    | UnshiftOperation
    | ShiftOperation
    | SliceOperation
    | RemoveOperation
    | MergeOperation;

const ops: Record<string, <T>(res: T, s: unknown) => T> = {
    $set,
    $unset,
    $push,
    $pop,
    $unshift,
    $shift,
    $slice,
    $remove,
    $merge: _.merge,
};

export const bulk = <T>(value: T, ...updates: BulkOperation[]): T =>
    updates.reduce(
        (value, update) => Object.entries(update).reduce((value, [op, spec]) => ops[op](value, spec), value),
        _.cloneDeep(value)
    );
