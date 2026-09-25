'use client';

import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import React, { StrictMode, useEffect, useState } from 'react';
import { Provider } from 'react-redux';

import { App } from '~/components/app/App';
import { ErrorBoundary } from '~/components/runtime/ErrorBoundary';
import { LocaleContext } from '~/components/runtime/LocaleContext';
import { getStore } from '~/store/store';
import { getTheme } from '~/styles/theme';

export function NextApp(): React.JSX.Element {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- renders only after browser hydration.
        setMounted(true);
    }, []);

    if (!mounted) {
        return <></>;
    }

    return (
        <StrictMode>
            <Provider store={getStore()}>
                <MantineProvider theme={getTheme()} defaultColorScheme="auto" classNamesPrefix="ui">
                    <ErrorBoundary>
                        <LocaleContext value="lt-LT">
                            <DatesProvider settings={{ locale: 'lt' }}>
                                <App />
                            </DatesProvider>
                        </LocaleContext>
                    </ErrorBoundary>
                </MantineProvider>
            </Provider>
        </StrictMode>
    );
}
