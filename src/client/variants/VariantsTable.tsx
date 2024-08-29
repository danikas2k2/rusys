import { isEmpty } from 'lodash';
import React, { useMemo } from 'react';
import { Label } from '~/client/common/Label';
import { Cell } from '~/client/table/Cell';
import { LoadingContent } from '~/client/table/LoadingContent';
import { Row } from '~/client/table/Row';
import { Table } from '~/client/table/Table';
import { matchParts } from '~/client/utils/matchParts';
import { SortableVariants } from '~/client/variants/SortableVariants';
import { useFilter } from '~/state/filter/useFilter';
import { useGroup } from '~/state/group/useGroup';
import { useGetGroups } from '~/state/groups/useGetGroups';
import { useGroups } from '~/state/groups/useGroups';
import { useGetVariants } from '~/state/variants/useGetVariants';
import { useVariants } from '~/state/variants/useVariants';
import cx from './VariantsTable.less';

export function VariantsTable() {
    const getVariants = useGetVariants();
    const getGroups = useGetGroups();
    const groups = useGroups().map((v) => v.group);
    const variants = useVariants();

    const group = useGroup();
    const filter = useFilter();
    const filteredVariants = useMemo(
        () =>
            variants
                .filter((v) => (!group || v.group === group) && (!filter || matchParts(v.variant, filter)))
                .sort((a, b) => a.order - b.order),
        [variants, group, filter]
    );

    return (
        <LoadingContent
            loader={() => Promise.all([getGroups(), getVariants()])}
            hasData={!isEmpty(groups) && !isEmpty(variants)}
        >
            <Table
                className={cx('Table')}
                header={
                    <Row className={cx('Row', 'HeadRow')}>
                        <Cell />
                        <Cell key="name" role="columnheader" className={cx('Name')}>
                            <Label>Variant</Label>
                        </Cell>
                        <Cell key="long" role="columnheader">
                            <Label>Long</Label>
                        </Cell>
                        <Cell key="short" role="columnheader">
                            <Label>Short</Label>
                        </Cell>
                    </Row>
                }
            >
                {groups.map((g) => {
                    const groupVariants = filteredVariants.filter((v) => v.group === g);
                    return groupVariants.length || (group && g === group) ? (
                        <div key={g} role="rowgroup">
                            <Row className={cx('Row', 'GroupRow')}>
                                <Cell role="rowheader" className={cx('GroupHeading')}>
                                    {g}
                                </Cell>
                            </Row>
                            <SortableVariants group={g} variants={groupVariants} />
                        </div>
                    ) : null;
                })}
            </Table>
        </LoadingContent>
    );
}
