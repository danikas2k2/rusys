import type { UpdateVariant, VariantAmount, VariantUnits } from '~/common/data';
import { VARIANT_UNITS } from '~/server/api/v1/utils';

export const isRequiredString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

export const isOptionalString = (value: unknown): value is string | undefined =>
    value === undefined || typeof value === 'string';

export const isRequiredBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

export const isOptionalBoolean = (value: unknown): value is boolean | undefined =>
    value === undefined || typeof value === 'boolean';

export const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export const isYear = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value) && value >= 0;

export const isArray = (value: unknown, minLength?: number, maxLength?: number): value is unknown[] =>
    Array.isArray(value) &&
    (minLength === undefined || value.length >= minLength) &&
    (maxLength === undefined || value.length <= maxLength);

export function isRecord(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    const prototype: unknown = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

export function isOrderMap(value: unknown): value is Readonly<Record<string, number>> {
    return (
        isRecord(value) &&
        Object.keys(value).length > 0 &&
        Object.entries(value).every(([key, order]) => key.length > 0 && isFiniteNumber(order))
    );
}

export function isUpdateVariant(value: unknown): value is UpdateVariant {
    return (
        isRecord(value) &&
        Object.keys(value).every((key) => ['order', 'suffix', 'count', 'units'].includes(key)) &&
        (value.order === undefined || isFiniteNumber(value.order)) &&
        isOptionalString(value.suffix) &&
        (value.count === undefined || isFiniteNumber(value.count)) &&
        (value.units === undefined ||
            (typeof value.units === 'string' && VARIANT_UNITS.has(value.units as VariantUnits)))
    );
}

export function isVariantAmount(value: unknown): value is VariantAmount {
    return (
        isRecord(value) &&
        Object.keys(value).every((key) =>
            ['variant', 'amount', 'recycled', 'suspicious', 'home', 'expiresAt'].includes(key)
        ) &&
        isRequiredString(value.variant) &&
        isFiniteNumber(value.amount) &&
        isOptionalBoolean(value.recycled) &&
        isOptionalBoolean(value.suspicious) &&
        isOptionalBoolean(value.home) &&
        (value.expiresAt === undefined || isFiniteNumber(value.expiresAt))
    );
}

export function isVariantAmounts(value: unknown): value is readonly VariantAmount[] {
    return Array.isArray(value) && value.length > 0 && value.every(isVariantAmount);
}

export function isMoveFlags(value: unknown): value is Pick<VariantAmount, 'suspicious' | 'home' | 'expiresAt'> {
    return (
        isRecord(value) &&
        Object.keys(value).every((key) => ['suspicious', 'home', 'expiresAt'].includes(key)) &&
        isOptionalBoolean(value.suspicious) &&
        isOptionalBoolean(value.home) &&
        (value.expiresAt === undefined || isFiniteNumber(value.expiresAt))
    );
}
