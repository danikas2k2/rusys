import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';

import { Button, Stack } from '@mantine/core';

import { Label } from '~/client/common/Label';
import { ScreenError } from '~/client/common/ScreenError';

type ErrorBoundaryProps = Readonly<React.PropsWithChildren<unknown>>;
type ErrorBoundaryInfo = { componentStack?: string | null };

function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
    const handleReload = () => {
        resetErrorBoundary();
        globalThis.location.reload();
    };

    return (
        <ScreenError>
            <Stack gap="sm" align="center">
                <Label>Unexpected error occurred</Label>
                <Button variant="filled" color="red" onClick={handleReload}>
                    <Label>Reload page</Label>
                </Button>
            </Stack>
        </ScreenError>
    );
}

export function ErrorBoundary({ children }: ErrorBoundaryProps): React.ReactElement {
    const handleError = (error: Error, info: ErrorBoundaryInfo) => {
        // eslint-disable-next-line no-console
        console.error(`[ERR] ErrorBoundary caught error: ${error}`, info);
    };

    return (
        <ReactErrorBoundary onError={handleError} fallbackRender={ErrorFallback}>
            {children}
        </ReactErrorBoundary>
    );
}
