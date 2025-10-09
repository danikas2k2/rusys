import { waitFor } from '@testing-library/react';

import { bootstrap } from '~/client/bootstrap';

jest.mock('~/client/bootstrap', () => ({
    bootstrap: jest.fn(),
}));

describe('index', () => {
    it('calls bootstrap function', async () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('~/client/index');
        await waitFor(() => expect(bootstrap).toHaveBeenCalledWith());
    });
});
