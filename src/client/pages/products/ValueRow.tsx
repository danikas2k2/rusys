import React, { useCallback } from 'react';

import { Checkbox, Table, Title } from '@mantine/core';
import { isEmpty } from 'lodash';
import moment from 'moment';

import { ValueCell } from '~/client/pages/products/ValueCell';
import { useHasRemoving } from '~/client/state/products/useHasRemoving';
import { useSetProductMissing } from '~/client/state/products/useSetProductMissing';
import { useYears } from '~/client/state/years/useYears';
import { SwipeableTableRow } from '~/client/table/SwipeableTableRow';
import { getCombinedAmounts } from '~/common/utils/amounts';
import type { RemovingYearAmounts, VariantAmount } from '~/types/data';

import './ValueRow.pcss';

export interface ValueRowProps {
    group: string;
    name: string;
    years?: readonly RemovingYearAmounts[];
    annual?: boolean;
    missing?: boolean;
    onStart?: (name: string) => void;
    onStop?: () => void;
    onPin?: (hide?: boolean) => void;
    onUnpin?: (hide?: boolean) => void;
}

export function ValueRow({ group, name, years, annual = true, missing }: ValueRowProps) {
    const available = !isEmpty(years);

    const allYears = useYears();
    const lastYear = allYears[allYears.length - 1];
    const thisYear = +moment().format('YY');
    const prevYear = thisYear - 1;

    const hasRemoving = useHasRemoving(group, name);

    const setMissing = useSetProductMissing();
    const handleClick = useCallback(async (): Promise<void> => {
        if (available) {
            await setMissing(group, name, !missing);
        }
    }, [available, setMissing, group, name, missing]);

    const rowRef = useCallback(() => {
        // No-op ref callback - SwipeableTableRow handles ref internally
    }, []);

    return (
        <SwipeableTableRow ref={rowRef} id={`${group}:${name}`} data={{ group, name }} data-group={group}>
            <Table.Td>
                <Checkbox
                    variant="outline"
                    checked={!missing}
                    disabled={!available}
                    indeterminate={!available}
                    onChange={handleClick}
                    label={
                        <Title order={6} data-available={available} data-removing={available && hasRemoving}>
                            {name}
                        </Title>
                    }
                />
            </Table.Td>
            {annual ? (
                allYears
                    .map((year) => years?.find((v) => v.year === year) ?? ({ year } as RemovingYearAmounts))
                    .map(({ year, amounts, removing }) => (
                        <ValueCell
                            key={year}
                            year={year}
                            group={group}
                            name={name}
                            amounts={amounts}
                            preferred={!removing && isPreferred(year, amounts)}
                            removing={removing}
                            last={year === lastYear}
                        />
                    ))
            ) : (
                <ValueCell
                    key={0}
                    year={0}
                    group={group}
                    name={name}
                    amounts={getCombinedAmounts(years)}
                    span={allYears.length}
                />
            )}
        </SwipeableTableRow>
    );

    function isPreferred(year: number, amounts?: readonly VariantAmount[]): boolean {
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
