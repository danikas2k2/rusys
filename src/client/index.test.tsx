import { waitFor } from '@testing-library/react';

import { describe, expect, it, vi } from 'vitest';

import { bootstrap } from '~/client/bootstrap';

vi.mock('~/client/bootstrap', () => ({
    bootstrap: vi.fn(),
}));

describe('index', () => {
    it('calls bootstrap function', async () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('~/client/index');
        await waitFor(() => expect(bootstrap).toHaveBeenCalledWith());
    });
});
