import React, { useMemo } from 'react';

import { ActiveRowWrapper } from '~/client/app/common/ActiveRowContext';
import { ActiveRowOutsideClick } from '~/client/app/common/ActiveRowOutsideClick';
import { Label } from '~/client/app/common/Label';
import { LoadingContent } from '~/client/app/common/LoadingContent';
import { useQuickFilter } from '~/client/app/filters/hooks/useQuickFilter';
import { ActiveGroupBox } from '~/client/app/groups/ActiveGroupBox';
import { useGroupsHasData } from '~/client/app/groups/hooks/useGroupsHasData';
import { SortableGroups } from '~/client/app/groups/SortableGroups';
import { Cell } from '~/client/app/table/Cell';
import { Row } from '~/client/app/table/Row';
import { Table } from '~/client/app/table/Table';
import { matchParts } from '~/client/app/utils/matchParts';
import { useGetGroups } from '~/client/state/groups/useGetGroups';
import { useGroups } from '~/client/state/groups/useGroups';
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
