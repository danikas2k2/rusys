import React, { useMemo } from 'react';

import cs from 'classnames';

import { useQuickFilter } from '~/client/filters/hooks/useQuickFilter';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import { matchParts } from '~/client/utils/matchParts';
import { SortableVariants } from '~/client/variants/SortableVariants';
import { useGroupVariants } from '~/state/variants/useGroupVariants';
import cx from './SortableGroup.pcss';

interface SortableVariantsProps {
    className?: string;
    group: string;
}

export function SortableGroup({ className, group }: SortableVariantsProps) {
    const filter = useQuickFilter();
    const variants = useGroupVariants(group);
    const filteredVariants = useMemo(
        () => variants.filter((v) => !filter || matchParts(v.variant, filter)).sort((a, b) => a.order - b.order),
        [variants, filter]
    );
    return filteredVariants.length ? (
        <div key={group} role="rowgroup" className={cx('RowGroup')}>
            <Row className={cs(className, cx('Row', 'GroupRow'))}>
                <Cell role="rowheader" className={cx('GroupHeading')}>
                    {group}
                </Cell>
            </Row>
            <SortableVariants className={className} group={group} variants={filteredVariants} />
        </div>
    ) : null;
}
