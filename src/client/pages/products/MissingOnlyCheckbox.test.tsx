import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useQuickFilter } from '~/client/filters/QuickFilterContext';
import { useHasFilteredMissing } from '~/client/pages/products/hooks/useHasFilteredMissing';
import { MissingOnlyCheckbox } from '~/client/pages/products/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { useHasMissing } from '~/client/state/products/useHasMissing';

jest.mock('~/client/pages/products/MissingOnlyContext', () => ({
    useMissingOnly: jest.fn(),
}));
jest.mock('~/client/pages/products/hooks/useHasFilteredMissing', () => ({
    useHasFilteredMissing: jest.fn(),
}));
jest.mock('~/client/filters/QuickFilterContext', () => ({
    useQuickFilter: jest.fn(),
}));
jest.mock('~/client/state/products/useHasMissing', () => ({
    useHasMissing: jest.fn(),
}));

describe('<MissingOnlyCheckbox>', () => {
    const setMissingOnly = jest.fn();
    const setFilter = jest.fn();

    beforeEach(() => {
        jest.mocked(useMissingOnly).mockReturnValue([false, setMissingOnly]);
        jest.mocked(useHasMissing).mockReturnValue(true);
        jest.mocked(useHasFilteredMissing).mockReturnValue(false);
        jest.mocked(useQuickFilter).mockReturnValue(['', setFilter]);
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

    it('toggles to missing only and clears filter when missing exist and not filtered', async () => {
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        await user.click(screen.getByRole('checkbox'));

        expect(setMissingOnly).toHaveBeenCalledWith(true);
        expect(setFilter).toHaveBeenCalledWith('');
    });

    it('toggles to all items when currently missing only', async () => {
        jest.mocked(useMissingOnly).mockReturnValueOnce([true, setMissingOnly]);
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        await user.click(screen.getByRole('checkbox'));

        expect(setMissingOnly).toHaveBeenCalledWith(false);
        expect(setFilter).not.toHaveBeenCalled();
    });

    it('does not clear filter when filtered missing exist', async () => {
        jest.mocked(useHasFilteredMissing).mockReturnValue(true);
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        await user.click(screen.getByRole('checkbox'));

        expect(setMissingOnly).toHaveBeenCalledWith(true);
        expect(setFilter).not.toHaveBeenCalled();
    });

    it('resets missingOnly to false when filtered missing disappear', () => {
        jest.mocked(useMissingOnly).mockReturnValue([true, setMissingOnly]);
        jest.mocked(useHasFilteredMissing).mockReturnValue(false);

        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

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

    it('toggles checkbox only when onClick not passed', async () => {
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        await user.click(screen.getByRole('checkbox'));

        expect(setMissingOnly).toHaveBeenCalledWith(true);
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
