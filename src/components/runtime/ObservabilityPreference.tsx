'use client';

import { Alert, Box, Checkbox, Text } from '@mantine/core';
import React, { useState, useSyncExternalStore } from 'react';

import { useLabels } from '~/lib/hooks/useLabels';
import {
    browserPrivacyRequested,
    observabilityConfigured,
    observabilityConsented,
    setObservabilityConsent,
    subscribeObservability,
} from '~/lib/observability/faro';

export function ObservabilityPreference(): React.JSX.Element {
    const enabled = useSyncExternalStore(subscribeObservability, observabilityConsented, () => false);
    const configured = useSyncExternalStore(subscribeObservability, observabilityConfigured, () => false);
    const blocked = useSyncExternalStore(subscribeObservability, browserPrivacyRequested, () => false);
    const [storageFailed, setStorageFailed] = useState(false);
    const label = useLabels();
    return (
        <Box p="sm">
            <Checkbox
                label={label('Share optional diagnostics')}
                description={label(
                    'Send performance measurements, redacted browser errors and usage events (dialogs, form fields, validation, navigation and actions) to Grafana Cloud. Only predefined categories; no field values, inventory content or account details. Off by default; turn off here at any time. Applies to this browser.'
                )}
                checked={enabled && configured}
                disabled={!configured || blocked}
                onChange={(event) => setStorageFailed(!setObservabilityConsent(event.currentTarget.checked))}
            />
            {blocked && <Text size="xs">{label('Diagnostics blocked by your browser privacy preference.')}</Text>}
            {!configured && <Text size="xs">{label('Diagnostics are unavailable on this site.')}</Text>}
            {storageFailed && (
                <Alert role="alert">{label('Could not save your preference. Diagnostics remain off.')}</Alert>
            )}
        </Box>
    );
}
