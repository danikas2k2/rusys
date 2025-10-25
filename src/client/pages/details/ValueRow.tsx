import React, { useCallback, useRef } from 'react';

import { isEmpty } from 'lodash';
import moment from 'moment';

import { Checkbox } from '@ui/Checkbox';
import { Interactive } from '@ui/Interactive';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { useErrorWrapper } from '~/client/common/hooks/useErrorWrapper';
import { SwipePanel } from '~/client/common/SwipePanel';
import { ValueCell } from '~/client/pages/details/ValueCell';
import { useDeleteDetails } from '~/client/state/details/useDeleteDetails';
import { useHasRemoving } from '~/client/state/details/useHasRemoving';
import { useSetDetailsMissing } from '~/client/state/details/useSetDetailsMissing';
import { useYears } from '~/client/state/years/useYears';
import { Cell } from '~/client/table/Cell';
import { RowWithSlideControls } from '~/client/table/RowWithSlideControls';
import { getCombinedAmounts } from '~/common/utils/amounts';
import { type Details, type RemovingYearAmounts, type VariantAmount } from '~/types/data';
import cx from './ValueRow.pcss';

export interface ValueRowProps {
    className?: string;
    group: string;
    name: string;
    years?: ReadonlyArray<RemovingYearAmounts>;
    annual?: boolean;
    missing?: boolean;
    onStart?: (name: string) => void;
    onStop?: () => void;
    onPin?: (hide?: boolean) => void;
    onUnpin?: (hide?: boolean) => void;
}

export function ValueRow({ className, group, name, years, annual = true, missing }: ValueRowProps) {
    const labelId = `checkbox-${group}-${name}`;
    const available = !isEmpty(years);

    const allYears = useYears();
    const lastYear = allYears[allYears.length - 1];
    const thisYear = +moment().format('YY');
    const prevYear = thisYear - 1;

    const hasRemoving = useHasRemoving(group, name);

    const [active, setActive] = useActiveContent<Pick<Details, 'group' | 'name'>>();

    const ref = useRef<HTMLDivElement>(null);
    const isActive = active?.data?.group === group && active?.data?.name === name;

    const onStart = useCallback(
        () => setActive({ id: `${name}@${group}`, data: { group, name }, ref }),
        [group, name, setActive]
    );

    const setMissing = useSetDetailsMissing();
    const handleClick = useCallback(async (): Promise<void> => {
        setActive(undefined);
        if (available) {
            await setMissing(group, name, !missing);
        }
    }, [setActive, available, setMissing, group, name, missing]);

    const deleteDetails = useDeleteDetails();
    const handleRemove = useErrorWrapper(() => deleteDetails(group, name));

    return (
        <RowWithSlideControls
            ref={ref}
            className={className}
            aria-checked={!missing}
            onDragStart={onStart}
            controls={isActive ? <SwipePanel onRemove={handleRemove} /> : undefined}
        >
            <Cell>
                <Checkbox
                    color="blue"
                    checked={!missing}
                    disabled={!available}
                    indeterminate={!available}
                    aria-labelledby={labelId}
                    onClick={handleClick}
                />
            </Cell>
            <Cell id={labelId} className={cx('name', { unavailable: !available, removing: available && hasRemoving })}>
                <Interactive onClick={handleClick}>{name}</Interactive>
            </Cell>
            {annual ? (
                allYears
                    .map((year) => years?.find((v) => v.year === year) ?? ({ year } as RemovingYearAmounts))
                    .map(({ year, amounts, removing }) => (
                        <ValueCell
                            key={year}
                            group={group}
                            name={name}
                            year={year}
                            amounts={amounts}
                            preferred={!removing && isPreferred(year, amounts)}
                            removing={removing}
                            last={year === lastYear}
                        />
                    ))
            ) : (
                <ValueCell
                    key={0}
                    group={group}
                    name={name}
                    year={0}
                    amounts={getCombinedAmounts(years)}
                    span={allYears.length}
                />
            )}
        </RowWithSlideControls>
    );

    function isPreferred(year: number, amounts?: ReadonlyArray<VariantAmount>): boolean {
        if (!amounts?.length) {
            return false;
        }
        if (year === thisYear) {
            return !years?.some((v) => v.year === prevYear && !!v.amounts?.length && !v.removing);
        }
        if (year === prevYear) {
            return true;
        }
        return !years?.some((v) => v.year > year && !!v.amounts?.length && !v.removing);
    }
}
