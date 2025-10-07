import { waitFor } from '@testing-library/react';

import { bootstrap } from '~/client/app/bootstrap';

jest.mock('~/client/app/bootstrap', () => ({
    bootstrap: jest.fn(),
}));

describe('index', () => {
    it('calls bootstrap function', async () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('~/client/app/index');
        await waitFor(() => expect(bootstrap).toHaveBeenCalledWith());
    });
});
