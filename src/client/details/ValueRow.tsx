import { Checkbox } from '@ui/Checkbox';
import { Interactive } from '@ui/Interactive';
import { isEmpty } from 'lodash';
import React, { type ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { type ActiveRow, useActiveRow } from '~/client/common/ActiveRowContext';
import { DetailsControls } from '~/client/details/DetailsControls';
import { ValueCell } from '~/client/details/ValueCell';
import { Cell } from '~/client/table/Cell';
import { RowWithSlideControls } from '~/client/table/RowWithSlideControls';
import { type Details, type RemovingYearAmounts } from '~/common/types';
import { useHasRemoving } from '~/state/details/useHasRemoving';
import { useSetDetailsMissing } from '~/state/details/useSetDetailsMissing';
import { useYears } from '~/state/years/useYears';
import cx from './ValueRow.less';

export interface ActiveDetails extends ActiveRow, Pick<Details, 'group' | 'name'> {}

export interface ValueRowProps {
    className?: string;
    group: string;
    name: string;
    years?: ReadonlyArray<RemovingYearAmounts>;
    missing?: boolean;
    onStart?: (name: string) => void;
    onStop?: () => void;
    onPin?: (hide?: boolean) => void;
    onUnpin?: (hide?: boolean) => void;
}

export function ValueRow({ className, group, name, years, missing }: ValueRowProps) {
    const labelId = `checkbox-${group}-${name}`;
    const available = !isEmpty(years);

    const allYears = useYears();
    const lastYear = allYears[allYears.length - 1];

    const hasRemoving = useHasRemoving(group, name);

    const [active, setActive] = useActiveRow<ActiveDetails>();

    const ref = useRef<HTMLDivElement>(null);
    const isActive = active?.group === group && active?.name === name;

    const onStart = useCallback(() => setActive({ group, name, ref }), [group, name, setActive]);

    const onPin = useCallback(() => setActive({ group, name, ref, pinned: true }), [group, name, setActive]);

    const onUnpin = useCallback(
        (hide = false) => {
            if (active) {
                setActive(hide ? undefined : { ...active, pinned: false });
            }
        },
        [active, setActive]
    );

    const setMissing = useSetDetailsMissing();
    const handleClick = useCallback(async (): Promise<void> => {
        onUnpin?.(true);
        if (available) {
            await setMissing(group, name, !missing);
        }
    }, [onUnpin, available, setMissing, group, name, missing]);

    return (
        <RowWithSlideControls
            ref={ref}
            className={className}
            aria-checked={!missing}
            onDragStart={onStart}
            controls={
                isActive ? <DetailsControls group={group} name={name} onPin={onPin} onUnpin={onUnpin} /> : undefined
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
            <Cell id={labelId} className={cx('name', { unavailable: !available, removing: available && hasRemoving })}>
                <Interactive onClick={handleClick}>{name}</Interactive>
            </Cell>
            {allYears
                .map((year) => years?.find((v) => v.year === year) ?? ({ year } as RemovingYearAmounts))
                .map(({ year, amounts, removing }) => (
                    <ValueCell
                        key={year}
                        group={group}
                        name={name}
                        year={year}
                        amounts={amounts}
                        removing={removing}
                        last={year === lastYear}
                    />
                ))}
        </RowWithSlideControls>
    );
}
