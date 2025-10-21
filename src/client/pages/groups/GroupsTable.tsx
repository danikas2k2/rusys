import React, { useMemo } from 'react';

import { ActiveRowWrapper } from '~/client/common/ActiveRowContext';
import { ActiveRowOutsideClick } from '~/client/common/ActiveRowOutsideClick';
import { Label } from '~/client/common/Label';
import { LoadingContent } from '~/client/common/LoadingContent';
import { useQuickFilter } from '~/client/filters/hooks/useQuickFilter';
import { ActiveGroupBox } from '~/client/pages/groups/ActiveGroupBox';
import { useGroupsHasData } from '~/client/pages/groups/hooks/useGroupsHasData';
import { SortableGroups } from '~/client/pages/groups/SortableGroups';
import { useGetGroups } from '~/client/state/groups/useGetGroups';
import { useGroups } from '~/client/state/groups/useGroups';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import { Table } from '~/client/table/Table';
import { matchParts } from '~/client/utils/matchParts';
import cx from './GroupsTable.pcss';

export function GroupsTable() {
    const groups = useGroups();
    const filter = useQuickFilter();
    const visibleGroups = useMemo(
        () => groups.filter((v) => matchParts(v.group, filter)).sort((a, b) => a.order - b.order),
        [filter, groups]
    );

    return (
        <LoadingContent loader={useGetGroups()} hasData={useGroupsHasData()}>
            <Table
                className={cx('Table')}
                header={
                    // TODO check if HeadRow is needed
                    <Row className={cx('Row', 'HeadRow')}>
                        <Cell />
                        <Cell key="name" role="columnheader" className={cx('Name')}>
                            <Label>Group</Label>
                        </Cell>
                        <Cell key="annual" role="columnheader" className={cx('Annual')}>
                            <Label>Annual</Label>
                        </Cell>
                    </Row>
                }
            >
                <ActiveRowWrapper>
                    <ActiveRowOutsideClick />
                    <SortableGroups className={cx('Row')} groups={visibleGroups} />
                    <ActiveGroupBox />
                </ActiveRowWrapper>
            </Table>
        </LoadingContent>
    );
}
