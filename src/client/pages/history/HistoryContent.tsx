import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { useYearFilter } from '~/client/filters/YearFilterContext';
import { useProfile } from '~/client/state/profile/useProfile';
import type { ProductUpdateHistoryItem } from '~/types/data';
import { HistoryTable } from './HistoryTable';
import { useHistoryUserProfiles } from './hooks/useHistoryUserProfiles';
import { buildSessions } from './utils/sessions';

export function HistoryContent({
    history,
    loading,
    error,
    reload,
}: {
    history: readonly ProductUpdateHistoryItem[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}) {
    const [groupFilter] = useGroupFilter();
    const [quickFilter] = useQuickFilter();
    const [active, setActive] = useActiveContent<ProductUpdateHistoryItem>();
    const [year] = useYearFilter();
    const me = useProfile();

    const historyEmails = useMemo(() => history.map((h) => h.user ?? '').filter(Boolean), [history]);
    const profilesByEmail = useHistoryUserProfiles(historyEmails);

    const openEdit = useCallback(
        (item: ProductUpdateHistoryItem) => {
            // open value-box editor
            setActive({ action: 'values', data: item });
        },
        [setActive]
    );

    const filtered = useMemo(() => {
        const gf = (groupFilter ?? '').trim().toLowerCase();
        const qf = (quickFilter ?? '').trim().toLowerCase();
        return history.filter((h) => {
            if (gf && h.group.toLowerCase() !== gf) {
                return false;
            }
            if (qf && !h.name.toLowerCase().includes(qf)) {
                return false;
            }
            return true;
        });
    }, [groupFilter, history, quickFilter]);

    const sessions = useMemo(() => {
        const allSessions = buildSessions(filtered);
        // Filtering is evaluated by session start time (first entry in the session).
        return allSessions.filter((s) => new Date(s.startTime).getFullYear() === year);
    }, [filtered, year]);

    return (
        <>
            {error && (
                <Alert variant="light" color="red" icon={<IconAlertCircle size={18} />} mb="sm">
                    {error}
                </Alert>
            )}

            <HistoryTable
                sessions={sessions}
                profilesByEmail={profilesByEmail}
                meEmail={me.email}
                mePicture={me.picture}
                active={active}
                setActive={() => setActive()}
                openEdit={openEdit}
            />
        </>
    );
}
