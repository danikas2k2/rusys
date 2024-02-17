import { Checkbox } from '@ui/Checkbox';
import { isEmpty } from 'lodash';
import React, { useCallback } from 'react';
import { ValueCell } from '~/client/details/ValueCell';
import { InteractiveName } from '~/client/InteractiveName';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
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
}

export function ValueRow({ className, group, name, amounts, missing }: ValueRowProps) {
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
            await setAmounts(group, name, year, amounts, withoutHistory);
            await setRemoving(group, name, year, false);
            if (!withoutHistory) {
                await setMissing(group, name, false);
            }
        },
        [setMissing, setAmounts, setRemoving]
    );

    const handleClick = useCallback(async (): Promise<void> => {
        if (available) {
            await setMissing(group, name, !missing);
        }
    }, [group, available, missing, name, setMissing]);

    const handleChange = useCallback(
        (year: number) =>
            useCallback(
                (amounts?: ReadonlyArray<VariantAmount>, withoutHistory = false) =>
                    handleValue(group, name, year, amounts, withoutHistory),
                [year]
            ),
        [group, handleValue, name]
    );

    return (
        <Row key={name} className={className} aria-checked={!missing}>
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
                <InteractiveName name={name} onClick={handleClick} />
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
        </Row>
    );
}
