import React from 'react';

import { Label } from '~/client/app/common/Label';
import { LoadingContent } from '~/client/app/common/LoadingContent';
import { useGroupFilter } from '~/client/app/filters/hooks/useGroupFilter';
import { Cell } from '~/client/app/table/Cell';
import { Row } from '~/client/app/table/Row';
import { Table } from '~/client/app/table/Table';
import { useVariantsHasData } from '~/client/app/variants/hooks/useVariantsHasData';
import { SortableGroups } from '~/client/app/variants/SortableGroups';
import { useGroups } from '~/client/state/groups/useGroups';
import { useGetVariants } from '~/client/state/variants/useGetVariants';
import cx from './VariantsTable.pcss';

export function VariantsTable() {
    const groups = useGroups().map((v) => v.group);
    const group = useGroupFilter();
    const visibleGroups = group ? [group] : groups;
    return (
        <LoadingContent loader={useGetVariants()} hasData={useVariantsHasData()}>
            <Table
                className={cx('Table')}
                header={
                    <Row className={cx('Row', 'HeadRow')}>
                        <Cell />
                        <Cell key="name" role="columnheader" className={cx('Name')}>
                            <Label>Variant</Label>
                        </Cell>
                        <Cell key="suffix" role="columnheader">
                            <Label>Suffix</Label>
                        </Cell>
                    </Row>
                }
            >
                <SortableGroups className={cx('Row')} groups={visibleGroups} />
            </Table>
        </LoadingContent>
    );
}
