import { Button, Stack } from '@mantine/core';
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';

import { Label } from '~/client/common/Label';
import { ScreenError } from '~/client/common/ScreenError';

export function reloadPage(): void {
    globalThis.location.reload();
}

type ErrorFallbackProps = FallbackProps & { onReload?: () => void };

function ErrorFallback({ resetErrorBoundary, onReload }: ErrorFallbackProps) {
    const handleReload = () => {
        const doReload = onReload ?? reloadPage;
        resetErrorBoundary();
        doReload();
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

type ErrorBoundaryProps = Readonly<React.PropsWithChildren<{ onReload?: () => void }>>;

export function ErrorBoundary({ children, onReload }: ErrorBoundaryProps): React.ReactElement {
    const handleError = (error: unknown, info: React.ErrorInfo) => {
        const message = error instanceof Error ? error.message : String(error);
        // eslint-disable-next-line no-console
        console.error(`[ERR] ErrorBoundary caught error: ${message}`, info);
    };

    const renderFallback = (props: FallbackProps) => <ErrorFallback {...props} onReload={onReload} />;

    return (
        <ReactErrorBoundary onError={handleError} fallbackRender={renderFallback}>
            {children}
        </ReactErrorBoundary>
    );
}
