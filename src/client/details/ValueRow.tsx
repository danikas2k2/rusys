import { Checkbox } from '@ui/Checkbox';
import { Interactive } from '@ui/Interactive';
import { isEmpty } from 'lodash';
import React, { type ForwardedRef, forwardRef, useCallback } from 'react';
import { DetailsControls } from '~/client/details/DetailsControls';
import { ValueCell } from '~/client/details/ValueCell';
import { Cell } from '~/client/table/Cell';
import { RowWithSlideControls } from '~/client/table/RowWithSlideControls';
import { type RemovingYearAmounts, type VariantAmount } from '~/common/types';
import { useHasRemoving } from '~/state/details/useHasRemoving';
import { useSetDetailsAmounts } from '~/state/details/useSetDetailsAmounts';
import { useSetDetailsMissing } from '~/state/details/useSetDetailsMissing';
import { useSetDetailsRemoving } from '~/state/details/useSetDetailsRemoving';
import { useYears } from '~/state/years/useYears';
import cx from './ValueRow.less';

export interface ValueRowProps {
    className?: string;
    group: string;
    name: string;
    amounts?: ReadonlyArray<RemovingYearAmounts>;
    missing?: boolean;
    active?: boolean;
    onStart?: (name: string) => void;
    onStop?: () => void;
    onPin?: (hide?: boolean) => void;
    onUnpin?: (hide?: boolean) => void;
}

export const ValueRow = forwardRef(function ValueRow(
    { className, group, name, amounts, missing, active, onStart, onStop, onPin, onUnpin }: ValueRowProps,
    ref: ForwardedRef<HTMLDivElement>
) {
    const labelId = `checkbox-${group}-${name}`;
    const available = !isEmpty(amounts);

    const years = useYears();
    const lastYear = years[years.length - 1];

    const removing = useHasRemoving(group, name);

    const setAmounts = useSetDetailsAmounts();
    const setMissing = useSetDetailsMissing();
    const setRemoving = useSetDetailsRemoving();

    const handleValue = useCallback(
        async (
            group: string,
            name: string,
            year: number,
            amounts?: ReadonlyArray<VariantAmount>,
            withoutHistory = false
        ): Promise<void> => {
            // TODO optimize to send single request for `removing` and `missing` flags with `amounts`
            if (!amounts?.length) {
                await setRemoving(group, name, year, false);
            }
            await setAmounts(group, name, year, amounts, withoutHistory);
            if (!withoutHistory) {
                // TODO set missing=false only when any amount is decreased
                await setMissing(group, name, false);
            }
        },
        [setMissing, setAmounts, setRemoving]
    );

    const handleClick = useCallback(async (): Promise<void> => {
        onUnpin?.(true);
        if (available) {
            await setMissing(group, name, !missing);
        }
    }, [group, available, missing, name, setMissing]);

    const handleChange = useCallback(
        (year: number) =>
            (amounts?: ReadonlyArray<VariantAmount>, withoutHistory = false) =>
                handleValue(group, name, year, amounts, withoutHistory),
        [group, handleValue, name]
    );

    const handleStart = useCallback(() => onStart?.(name), [onStart, name]);

    const handleStop = useCallback(() => onStop?.(), [onStop]);

    return (
        <RowWithSlideControls
            ref={active ? ref : undefined}
            className={className}
            aria-checked={!missing}
            onStart={handleStart}
            onStop={handleStop}
            controls={
                active ? <DetailsControls group={group} name={name} onPin={onPin} onUnpin={onUnpin} /> : undefined
            }
        >
            <Cell>
                <Checkbox
                    color="primary"
                    checked={!missing}
                    disabled={!available}
                    indeterminate={!available}
                    aria-labelledby={labelId}
                    onClick={handleClick}
                />
            </Cell>
            <Cell id={labelId} className={cx('name', { unavailable: !available, removing: available && removing })}>
                <Interactive onClick={handleClick}>{name}</Interactive>
                {/*<ValueAmounts
                    className={cx('total')}
                    group={group}
                    amounts={amounts?.reduce<VariantAmount[]>(
                        (res, { year, amounts, removing }) =>
                            removing || !years.includes(year)
                                ? res
                                : amounts.reduce<VariantAmount[]>(
                                      (res, y) =>
                                          !res.find((r) => r.variant === y.variant)
                                              ? [...res, y]
                                              : res.map((r) =>
                                                    r.variant === y.variant ? { ...r, amount: r.amount + y.amount } : r
                                                ),
                                      res
                                  ),
                        []
                    )}
                />*/}
            </Cell>
            {years
                .map((year) => amounts?.find((v) => v.year === year) ?? ({ year } as RemovingYearAmounts))
                .map(({ year, amounts, removing }) => (
                    <ValueCell
                        key={year}
                        group={group}
                        name={name}
                        year={year}
                        amounts={amounts}
                        removing={removing}
                        last={year === lastYear}
                        onChange={handleChange(year)}
                    />
                ))}
        </RowWithSlideControls>
    );
});
