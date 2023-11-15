import { waitFor } from '@testing-library/react';
import { bootstrap } from '~/client/bootstrap';

jest.mock('~/client/bootstrap', () => ({
    bootstrap: jest.fn(),
}));

describe('index', () => {
    it('calls bootstrap function', async () => {
        require('~/client/index');
        await waitFor(() => expect(bootstrap).toHaveBeenCalledWith());
    });
});
