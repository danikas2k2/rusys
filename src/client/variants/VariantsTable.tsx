import React from 'react';

import { Label } from '~/client/common/Label';
import { LoadingContent } from '~/client/common/LoadingContent';
import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { useGroups } from '~/client/state/groups/useGroups';
import { useGetVariants } from '~/client/state/variants/useGetVariants';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import { Table } from '~/client/table/Table';
import { useVariantsHasData } from '~/client/variants/hooks/useVariantsHasData';
import { SortableGroups } from '~/client/variants/SortableGroups';
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
