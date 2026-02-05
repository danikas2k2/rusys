import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React, { useCallback, useEffect, useMemo } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { useGroupFilter } from '~/client/filters/GroupFilterContext';
import { useGroupFilterPredicate } from '~/client/filters/hooks/useGroupFilterPredicate';
import { useQuickFilterPredicate } from '~/client/filters/hooks/useQuickFilterPredicate';
import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { useYearFilter } from '~/client/filters/YearFilterContext';
import { useProfile } from '~/client/state/profile/useProfile';
import type { History } from '~/types/data';
import { HistoryTable } from './HistoryTable';
import { useHistoryUserProfiles } from './hooks/useHistoryUserProfiles';
import { useHistorySessions } from './utils/sessions';

export function HistoryContent() {
    return (
        <HistoryTable
            sessions={sessions}
            profilesByEmail={profilesByEmail}
            meEmail={me.email}
            mePicture={me.picture}
            active={active}
            setActive={() => setActive()}
            openEdit={openEdit}
        />
    );
}
