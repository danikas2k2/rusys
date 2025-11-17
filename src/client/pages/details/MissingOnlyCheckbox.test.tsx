import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { MissingOnlyCheckbox } from '~/client/pages/details/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/pages/details/MissingOnlyContext';
import { useHasMissing } from '~/client/state/details/useHasMissing';

jest.mock('~/client/pages/details/MissingOnlyContext', () => ({
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
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        expect(screen.getByRole('checkbox')).toBeEnabled();
    });

    it('renders disabled checkbox if has no missing items', () => {
        jest.mocked(useHasMissing).mockReturnValue(false);
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('renders checked checkbox when showing all items', () => {
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('renders unchecked checkbox when showing missing only', () => {
        jest.mocked(useMissingOnly).mockReturnValueOnce([true, jest.fn()]);

        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('changes missing only state if missing only items are not selected', async () => {
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        await user.click(screen.getByRole('checkbox'));

        expect(setMissingOnly).toHaveBeenCalledWith(true);
    });

    it('changes missing only state if missing only items selected', async () => {
        jest.mocked(useMissingOnly).mockReturnValueOnce([true, setMissingOnly]);
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        await user.click(screen.getByRole('checkbox'));

        expect(setMissingOnly).toHaveBeenCalledWith(false);
    });

    it('calls onClick on checkbox click', async () => {
        const onClick = jest.fn();
        render(
            <MockTheme>
                <MissingOnlyCheckbox onClick={onClick} />
            </MockTheme>
        );

        await user.click(screen.getByRole('checkbox'));

        expect(onClick).toHaveBeenCalledWith();
    });

    it('does not change missing only state when hasMissing is false', async () => {
        jest.mocked(useHasMissing).mockReturnValue(false);
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        await user.click(screen.getByRole('checkbox'));

        expect(setMissingOnly).not.toHaveBeenCalled();
    });

    it('does not call onClick when checkbox is disabled', async () => {
        const onClick = jest.fn();
        jest.mocked(useHasMissing).mockReturnValue(false);
        render(
            <MockTheme>
                <MissingOnlyCheckbox onClick={onClick} />
            </MockTheme>
        );

        const checkbox = screen.getByRole('checkbox');

        expect(checkbox).toBeDisabled();

        await user.click(checkbox);

        expect(onClick).not.toHaveBeenCalled();
    });
});
