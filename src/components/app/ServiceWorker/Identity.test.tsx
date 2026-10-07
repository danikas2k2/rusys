import { render, waitFor } from '@testing-library/react';

import React from 'react';

import { ServiceWorkerIdentity } from './Identity';

describe('serviceWorkerIdentity', () => {
    const postMessage = vi.fn();

    beforeEach(() => {
        vi.stubEnv('NODE_ENV', 'production');
        Object.defineProperty(navigator, 'serviceWorker', {
            configurable: true,
            value: { ready: Promise.resolve({ active: { postMessage } }) },
        });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        Reflect.deleteProperty(navigator, 'serviceWorker');
        postMessage.mockClear();
    });

    it('tells the worker which signed-in account owns offline data', async () => {
        render(<ServiceWorkerIdentity sub="account-a" />);
        await waitFor(() => expect(postMessage).toHaveBeenCalledWith({ type: 'SET_USER', sub: 'account-a' }));
    });

    it('clears the worker identity after sign-out', async () => {
        render(<ServiceWorkerIdentity />);
        await waitFor(() => expect(postMessage).toHaveBeenCalledWith({ type: 'CLEAR_USER' }));
    });

    it('does nothing without a worker or outside production', async () => {
        Reflect.deleteProperty(navigator, 'serviceWorker');
        render(<ServiceWorkerIdentity sub="account-a" />);

        expect(postMessage).not.toHaveBeenCalled();

        vi.stubEnv('NODE_ENV', 'test');
        render(<ServiceWorkerIdentity sub="account-b" />);

        expect(postMessage).not.toHaveBeenCalled();
    });

    it('tolerates a worker without an active controller', async () => {
        Object.defineProperty(navigator, 'serviceWorker', {
            configurable: true,
            value: { ready: Promise.resolve({}) },
        });
        render(<ServiceWorkerIdentity sub="account-a" />);
        await Promise.resolve();

        expect(postMessage).not.toHaveBeenCalled();
    });
});
