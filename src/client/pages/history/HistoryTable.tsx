import { Table } from '@mantine/core';
import React from 'react';

import { Label } from '~/client/common/Label';
import { LoadableContent } from '~/client/common/LoadableContent';
import { useYearFilter } from '~/client/filters/YearFilterContext';
import { HistoryMissingData } from '~/client/pages/history/HistoryMissingData';
import { HistorySession } from '~/client/pages/history/HistorySession';
import { useHistoryHasData } from '~/client/pages/history/hooks/useHistoryHasData';
import { useHistorySessions } from '~/client/pages/history/hooks/useHistorySessions';
import { useGetHistory } from '~/client/state/history/useGetHistory';
import type { UserProfile } from '~/types/data';

type ProfilesByEmail = Record<string, UserProfile>;

export function HistoryTable(): React.ReactElement {
    // const me = useProfile();
    //
    // const historyEmails = useMemo(() => history.map((h) => h.user ?? '').filter(Boolean), [history]);
    // const profilesByEmail = useHistoryUserProfiles(historyEmails);
    //
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

    const [year] = useYearFilter();
    // const quickFilter = useQuickFilterPredicate();
    // const groupFilter = useGroupFilterPredicate();
    // const filtered = useMemo(
    //     () => history.filter((h) => groupFilter(h.group) && quickFilter(h.name)),
    //     [groupFilter, history, quickFilter]
    // );
    const sessions = useHistorySessions();
    const hasData = useHistoryHasData();

    return (
        <LoadableContent loader={useGetHistory(year)} hasData>
            {hasData ? (
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
                    {Object.entries(sessions).map(([s, hs]) => (
                        <HistorySession key={s} session={s} history={hs} />
                    ))}
                </Table>
            ) : (
                <HistoryMissingData />
            )}
        </LoadableContent>
    );
}
