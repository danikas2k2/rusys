import React from 'react';
import { ValueRow } from '~/client/details/ValueRow';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import { type Details } from '~/common/types';
import { useGroup } from '~/state/group/useGroup';
import cx from './DetailsGroups.less';

interface DetailsGroupsProps {
    groups: ReadonlyArray<string>;
    details: ReadonlyArray<Details>;
}

export function DetailsGroups({ groups, details }: DetailsGroupsProps) {
    const group = useGroup();
    return (
        <>
            {groups.map((g) => {
                const groupDetails = details.filter((v) => v.group === g);
                return groupDetails.length || (group && g === group) ? (
                    <div key={g} role="rowgroup">
                        <Row className={cx('Row', 'GroupRow')}>
                            <Cell role="rowheader" className={cx('GroupHeading')}>
                                {g}
                            </Cell>
                        </Row>
                        <div className={cx('GroupedRows')}>
                            {groupDetails.map((d) => (
                                <ValueRow
                                    key={`${d.group}:${d.name}`}
                                    className={cx('Row')}
                                    group={g}
                                    name={d.name}
                                    years={d.years}
                                    missing={d.missing}
                                />
                            ))}
                        </div>
                    </div>
                ) : null;
            })}
        </>
    );
}
