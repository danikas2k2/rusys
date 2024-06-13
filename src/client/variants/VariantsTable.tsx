import { Checkbox } from '@ui/Checkbox';
import { isEmpty } from 'lodash';
import React, { useMemo } from 'react';
import { useUniqueGroups } from '~/client/hooks/useUniqueGroups';
import { Label } from '~/client/common/Label';
import { Cell } from '~/client/table/Cell';
import { LoadingContent } from '~/client/table/LoadingContent';
import { Row } from '~/client/table/Row';
import { Table } from '~/client/table/Table';
import { matchParts } from '~/client/utils/matchParts';
import { useFilter } from '~/state/filter/useFilter';
import { useVariants } from '~/state/variants/useVariants';
import { useGetVariants } from '~/state/variants/useGetVariants';
import cx from './VariantsTable.less';

export function VariantsTable() {
    const getVariants = useGetVariants();

    const filter = useFilter();
    const variants = useVariants();
    const filteredVariants = useMemo(
        () =>
            variants
                .filter((v) => matchParts(v.group, filter) || matchParts(v.variant, filter))
                .sort((a, b) => a.order - b.order),
        [variants, filter]
    );

    const groups = useUniqueGroups(filteredVariants);

    return (
        <LoadingContent loader={getVariants} hasData={!isEmpty(variants)}>
            <Table
                className={cx('Table')}
                header={
                    <Row className={cx('Row', 'HeadRow')}>
                        <Cell key="name" role="columnheader" className={cx('Name')}>
                            <Label>Name</Label>
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
                {groups.map((group) => (
                    <div key={group} role="rowgroup">
                        <Row className={cx('Row', 'GroupRow')}>
                            <Cell role="rowheader" className={cx('GroupHeading')}>
                                {group}
                            </Cell>
                        </Row>
                        {filteredVariants
                            .filter((v) => v.group === group)
                            .map((v) => (
                                <Row key={`${v.group}:${v.variant}`} className={cx('Row')}>
                                    <Cell key="name" className={cx('Name')}>
                                        {v.variant}
                                    </Cell>
                                    <Cell key="long">{v.long}</Cell>
                                    <Cell key="short">{v.short}</Cell>
                                </Row>
                            ))}
                    </div>
                ))}
            </Table>
        </LoadingContent>
    );
}
