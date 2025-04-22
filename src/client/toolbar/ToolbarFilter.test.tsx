import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withReduxState } from '@tests/withReduxState';
import { ToolbarFilter } from '~/client/toolbar/ToolbarFilter';
import { useClearFilter } from '~/state/filter/useClearFilter';
import { useFilter } from '~/state/filter/useFilter';
import { useSetFilter } from '~/state/filter/useSetFilter';

jest.mock('~/state/filter/useClearFilter');
jest.mock('~/state/filter/useFilter');
jest.mock('~/state/filter/useSetFilter');

describe('<ToolbarFilter>', () => {
    beforeEach(() => {
        jest.mocked(useFilter).mockReturnValue('');
        jest.mocked(useSetFilter).mockReturnValue(jest.fn());
        jest.mocked(useClearFilter).mockReturnValue(jest.fn());
    });

    afterEach(() => jest.clearAllMocks());

    it('renders input field with placeholder', () => {
        render(<ToolbarFilter />, withReduxState());

        expect(screen.getByPlaceholderText('type to filter')).toBeInTheDocument();
    });

    it('updates filter value when input field is changed', async () => {
        const setFilter = jest.fn();
        jest.mocked(useSetFilter).mockReturnValue(setFilter);

        render(<ToolbarFilter />, withReduxState());

        await userEvent.type(screen.getByPlaceholderText('type to filter'), 'x');

        expect(setFilter).toHaveBeenCalledWith('x');
    });

    it('clears filter value when clear button is clicked', async () => {
        const clearFilter = jest.fn();
        jest.mocked(useClearFilter).mockReturnValue(clearFilter);
        jest.mocked(useFilter).mockReturnValue('x');

        render(<ToolbarFilter />, withReduxState());

        await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

        expect(clearFilter).toHaveBeenCalledWith();
    });
});
