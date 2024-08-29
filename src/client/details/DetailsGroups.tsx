import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import React, { useCallback, useRef, useState } from 'react';
import { ValueRow } from '~/client/details/ValueRow';
import { Cell } from '~/client/table/Cell';
import { Row } from '~/client/table/Row';
import type { Details } from '~/common/types';
import { useGroup } from '~/state/group/useGroup';
import cx from './DetailsGroups.less';

interface DetailsGroupsProps {
    groups: readonly string[];
    details: readonly Details[];
}

export function DetailsGroups({ groups, details }: DetailsGroupsProps) {
    const group = useGroup();

    const [activeName, setActiveName] = useState<string>();
    const setInactive = useCallback(() => setActiveName(undefined), []);

    const onStart = useCallback(
        (value: string) => {
            if (activeName !== value) {
                setActiveName(value);
            }
        },
        [activeName]
    );

    const onStop = useCallback(() => {}, []);

    const [pinned, setPinned] = useState(false);
    const onPin = useCallback(
        (hide = false) => {
            if (hide) {
                setInactive();
            }
            setPinned(true);
        },
        [setInactive]
    );
    const onUnpin = useCallback(
        (hide = false) => {
            if (hide) {
                setInactive();
            }
            setPinned(false);
        },
        [setInactive]
    );

    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(pinned ? { current: null } : ref, setInactive);

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
                            {groupDetails.map((v) => (
                                <ValueRow
                                    key={`${v.group}:${v.name}`}
                                    ref={ref}
                                    className={cx('Row')}
                                    group={g}
                                    name={v.name}
                                    amounts={v.years}
                                    missing={v.missing}
                                    active={activeName === v.name}
                                    onStart={onStart}
                                    onStop={onStop}
                                    onPin={onPin}
                                    onUnpin={onUnpin}
                                />
                            ))}
                        </div>
                    </div>
                ) : null;
            })}
        </>
    );
}
