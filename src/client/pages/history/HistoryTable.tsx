import { Table, Text } from '@mantine/core';
import React, { useMemo } from 'react';

import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { useYearFilter } from '~/client/filters/YearFilterContext';
import { useHistoryHasData } from '~/client/pages/history/hooks/useHistoryHasData';
import { SessionTitle } from '~/client/pages/history/SessionTitle';
import { useGetHistory } from '~/client/state/history/useGetHistory';
import { useHistory } from '~/client/state/history/useHistory';
import { SwipeableRow } from '~/client/table/SwipeableRow';
import { formatTime } from '~/client/utils/time';
import type { History, UserProfile } from '~/types/data';
import { AmountsCell } from './components/AmountsCell';

type ProfilesByEmail = Record<string, UserProfile>;

export function HistoryTable(): React.ReactElement {
    const [year] = useYearFilter();
    const history = useHistory();

    const sessions = useMemo(() => {
        return history.reduce<Record<string, History[]>>((r, h) => {
            const sessionId = h.sessionId || h.time;
            r[sessionId] = [...(r[sessionId] || []), h];
            return r;
        }, {});
    }, [history]);

    // const { history, loading, error, reload } = useGetHistory(year);
    //
    // const [active, setActive] = useActiveContent<History>();
    // const me = useProfile();
    //
    // const historyEmails = useMemo(() => history.map((h) => h.user ?? '').filter(Boolean), [history]);
    // const profilesByEmail = useHistoryUserProfiles(historyEmails);
    //
    // const openEdit = useCallback(
    //     (item: History) => {
    //         // open value-box editor
    //         setActive({ action: 'values', data: item });
    //     },
    //     [setActive]
    // );
    //
    // const quickFilter = useQuickFilterPredicate();
    // const groupFilter = useGroupFilterPredicate();
    // const filtered = useMemo(
    //     () => history.filter((h) => groupFilter(h.group) && quickFilter(h.name)),
    //     [groupFilter, history, quickFilter]
    // );

    /*const sessions = useMemo(() => {
        const allSessions = useHistorySessions(history);
        // Filtering is evaluated by session start time (first entry in the session).
        return allSessions.filter((s) => new Date(s.startTime).getFullYear() === year);
    }, [filtered, year]);*/

    // const ContinuationMark = () => (
    //     <div
    //         aria-hidden="true"
    //         style={{
    //             height: '1.75rem',
    //             width: 0,
    //             marginInline: 'auto',
    //             borderLeft: '2px dotted var(--table-border-color)',
    //             opacity: 0.6,
    //         }}
    //     />
    // );
    //
    // // stable helpers per render
    // const renderSession = useMemo(
    //     () => (s: HistorySession) => {
    //         const timeKey = (h: History) => minuteKey(h.time); // minute precision
    //         const nameGroupKey = (h: History) => `${h.name}\n${h.group}`;
    //         const yearKey = (h: History) => h.year;
    //         const runKey = (h: History) => `${timeKey(h)}|${nameGroupKey(h)}|${h.year ?? 0}`;
    //
    //         const showIfChanged = <T,>(items: readonly History[], idx: number, k: (h: History) => T) => {
    //             if (idx === 0) return true;
    //             return k(items[idx]!) !== k(items[idx - 1]!);
    //         };
    //
    //         const runs = (() => {
    //             const out: Array<{ start: number; end: number }> = [];
    //             let i = 0;
    //             while (i < s.items.length) {
    //                 const k = runKey(s.items[i]!);
    //                 let j = i + 1;
    //                 while (j < s.items.length && runKey(s.items[j]!) === k) j += 1;
    //                 out.push({ start: i, end: j });
    //                 i = j;
    //             }
    //             return out;
    //         })();
    //
    //         const stickyStyle: React.CSSProperties = {
    //             position: 'sticky',
    //             insetBlockStart: '5rem',
    //             zIndex: 0,
    //             background: 'var(--mantine-color-body)',
    //         };
    //
    //         return (
    //             <React.Fragment key={`${s.startTime}-${s.endTime}`}>
    //                 <GroupTitle colSpan={4}>
    //                     <Group justify="space-between">
    //                         <Group wrap="nowrap" gap="xs">
    //                             <EmailAvatar
    //                                 email={s.items[0]?.user}
    //                                 profile={
    //                                     s.items[0]?.user ? profilesByEmail[s.items[0].user.toLowerCase()] : undefined
    //                                 }
    //                                 fallbackPicture={
    //                                     s.items[0]?.user &&
    //                                     meEmail &&
    //                                     s.items[0].user.toLowerCase() === meEmail.toLowerCase()
    //                                         ? mePicture
    //                                         : undefined
    //                                 }
    //                             />
    //                             <Label>{formatSessionStartTitle(s.startTime)}</Label>
    //                         </Group>
    //                     </Group>
    //                 </GroupTitle>
    //                 {runs.map(({ start, end }) => {
    //                     const runItems = s.items.slice(start, end);
    //                     const stickyEnabled = runItems.length > 1;
    //                     return (
    //                         <Table.Tbody key={`${s.startTime}-${start}`}>
    //                             {runItems.map((h, runIdx) => {
    //                                 const idx = start + runIdx;
    //                                 const showTime = showIfChanged(s.items, idx, timeKey);
    //                                 const showNameGroup = showIfChanged(s.items, idx, nameGroupKey);
    //                                 const hasYear = h.year !== 0;
    //                                 const showYear = hasYear && showIfChanged(s.items, idx, yearKey);
    //
    //                                 const stickyThisRow = stickyEnabled && runIdx === 0;
    //
    //                                 return (
    //                                     <SwipeableRow
    //                                         key={h.id}
    //                                         id={h.id}
    //                                         data={h}
    //                                         data-group={h.group}
    //                                         style={{ cursor: 'pointer' }}
    //                                         onClick={() => {
    //                                             // If this row is currently swiped open, clicking closes it
    //                                             if (active?.id === h.id && active?.offset && !active?.action) {
    //                                                 setActive();
    //                                                 return;
    //                                             }
    //
    //                                             setActive();
    //                                             openEdit(h);
    //                                         }}
    //                                     >
    //                                         <Table.Td style={stickyThisRow && showTime ? stickyStyle : undefined}>
    //                                             {showTime ? formatTimeHHmm(h.time) : <ContinuationMark />}
    //                                         </Table.Td>
    //                                         <Table.Td
    //                                             colSpan={hasYear ? 1 : 2}
    //                                             style={stickyThisRow && showNameGroup ? stickyStyle : undefined}
    //                                         >
    //                                             {showNameGroup ? (
    //                                                 <>
    //                                                     <Text size="sm">{h.name}</Text>
    //                                                     <Text size="xs" c="dimmed">
    //                                                         {h.group}
    //                                                     </Text>
    //                                                 </>
    //                                             ) : (
    //                                                 <ContinuationMark />
    //                                             )}
    //                                         </Table.Td>
    //                                         {hasYear && (
    //                                             <Table.Td style={stickyThisRow && showYear ? stickyStyle : undefined}>
    //                                                 {showYear ? h.year : <ContinuationMark />}
    //                                             </Table.Td>
    //                                         )}
    //                                         <Table.Td>
    //                                             <AmountsCell amounts={h.amounts ?? []} />
    //                                         </Table.Td>
    //                                     </SwipeableRow>
    //                                 );
    //                             })}
    //                         </Table.Tbody>
    //                     );
    //                 })}
    //             </React.Fragment>
    //         );
    //     },
    //     [active, meEmail, mePicture, openEdit, profilesByEmail, setActive]
    // );

    return (
        <LoadableContent loader={useGetHistory(year)} hasData={useHistoryHasData()}>
            <Table layout="fixed" data-table="history">
                <Table.Thead>
                    <Table.Tr h="3rem">
                        <Table.Th>
                            <Label>Time</Label>
                        </Table.Th>
                        <Table.Th>
                            <Label>Name</Label>
                        </Table.Th>
                        <Table.Th>
                            <Label>Year</Label>
                        </Table.Th>
                        <Table.Th>
                            <Label>Amounts</Label>
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                {Object.entries(sessions).map(([s, hs]) => {
                    return (
                        <>
                            <SessionTitle session={s} />
                            <Table.Tbody>
                                {hs.map((h) => (
                                    <SwipeableRow
                                        key={h.time}
                                        id={`${h.time}`}
                                        data={h}
                                        data-group={h.group}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Table.Td>{formatTime(new Date(h.time))}</Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{h.name}</Text>
                                            <Text size="xs" c="dimmed">
                                                {h.group}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>{h.year ?? '-'}</Table.Td>
                                        <Table.Td>
                                            <AmountsCell amounts={h.amounts ?? []} />
                                        </Table.Td>
                                    </SwipeableRow>
                                ))}
                            </Table.Tbody>
                        </>
                    );
                })}
            </Table>
        </LoadableContent>
    );
}
