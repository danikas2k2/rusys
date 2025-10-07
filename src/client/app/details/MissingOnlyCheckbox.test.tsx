import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import React from 'react';

import { MissingOnlyCheckbox } from '~/client/app/details/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/app/details/MissingOnlyContext';
import { useHasMissing } from '~/client/state/details/useHasMissing';

jest.mock('~/client/app/details/MissingOnlyContext', () => ({
    useMissingOnly: jest.fn(),
}));
jest.mock('~/client/state/details/useHasMissing', () => ({
    useHasMissing: jest.fn(),
}));

describe('<MissingOnlyCheckbox>', () => {
    const setMissingOnly = jest.fn();

    beforeEach(() => {
        jest.mocked(useMissingOnly).mockReturnValue([false, setMissingOnly]);
        jest.mocked(useHasMissing).mockReturnValue(true);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders enabled checkbox if has missing items', () => {
        render(<MissingOnlyCheckbox />);

        expect(screen.getByRole('checkbox')).toBeEnabled();
    });

    it('renders disabled checkbox if has no missing items', () => {
        jest.mocked(useHasMissing).mockReturnValue(false);
        render(<MissingOnlyCheckbox />);

        expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('renders checked checkbox if missing only items are not selected', () => {
        render(<MissingOnlyCheckbox />);

        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('renders unchecked checkbox if missing only items selected', () => {
        jest.mocked(useMissingOnly).mockReturnValueOnce([true, jest.fn()]);
        render(<MissingOnlyCheckbox />);

        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('changes missing only state if missing only items are not selected', async () => {
        render(<MissingOnlyCheckbox />);
        await userEvent.click(screen.getByRole('checkbox'));

        expect(setMissingOnly).toHaveBeenCalledWith(true);
    });

    it('changes missing only state if missing only items selected', async () => {
        jest.mocked(useMissingOnly).mockReturnValueOnce([true, setMissingOnly]);
        render(<MissingOnlyCheckbox />);
        await userEvent.click(screen.getByRole('checkbox'));

        expect(setMissingOnly).toHaveBeenCalledWith(false);
    });

    it('calls onClick on checkbox click', async () => {
        const onClick = jest.fn();
        render(<MissingOnlyCheckbox onClick={onClick} />);
        await userEvent.click(screen.getByRole('checkbox'));

        expect(onClick).toHaveBeenCalledWith();
    });
});
