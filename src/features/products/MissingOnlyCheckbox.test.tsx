import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useQuickFilter } from '~/features/filters/QuickFilterContext';
import { useHasFilteredMissing } from '~/features/products/hooks/useHasFilteredMissing';
import { MissingOnlyCheckbox } from '~/features/products/MissingOnlyCheckbox';
import { useMissingOnly } from '~/features/products/MissingOnlyContext';
import { useHasMissing, useProducts } from '~/store/products';

vi.mock(import('~/features/products/MissingOnlyContext'), () => ({
    useMissingOnly: vi.fn(),
}));
vi.mock(import('~/features/products/hooks/useHasFilteredMissing'), () => ({
    useHasFilteredMissing: vi.fn(),
}));
vi.mock(import('~/features/filters/QuickFilterContext'), () => ({
    useQuickFilter: vi.fn(),
}));
vi.mock(import('~/store/products/useHasMissing'), () => ({
    useHasMissing: vi.fn(),
}));
vi.mock(import('~/store/products/useProducts'), () => ({
    useProducts: vi.fn(),
}));

describe('<MissingOnlyCheckbox>', () => {
    const setMissingOnly = vi.fn();
    const setFilter = vi.fn();

    beforeEach(() => {
        vi.mocked(useMissingOnly).mockReturnValue([false, setMissingOnly]);
        vi.mocked(useHasMissing).mockReturnValue(true);
        vi.mocked(useProducts).mockReturnValue([]);
        vi.mocked(useHasFilteredMissing).mockReturnValue(false);
        vi.mocked(useQuickFilter).mockReturnValue(['', setFilter]);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders enabled checkbox if has missing items', () => {
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        expect(screen.getByRole('checkbox')).toBeEnabled();
    });

    it('renders disabled checkbox if has no missing items', () => {
        vi.mocked(useHasMissing).mockReturnValue(false);
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('shows the missing product count next to the checkbox', () => {
        vi.mocked(useProducts).mockReturnValue([
            { group: 'Uogienės', name: 'Avietės', missing: true, years: [] },
            { group: 'Uogienės', name: 'Braškės', missing: true, years: [] },
        ]);
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        expect(screen.getByText('Missing 2 products')).toBeInTheDocument();
    });

    it('shows that nothing is missing when there are no missing products', () => {
        vi.mocked(useHasMissing).mockReturnValue(false);
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        expect(screen.getByText('No products missing')).toBeInTheDocument();
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
        vi.mocked(useMissingOnly).mockReturnValueOnce([true, vi.fn()]);

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
        vi.mocked(useMissingOnly).mockReturnValueOnce([true, setMissingOnly]);
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
        vi.mocked(useHasFilteredMissing).mockReturnValue(true);
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
        vi.mocked(useMissingOnly).mockReturnValue([true, setMissingOnly]);
        vi.mocked(useHasFilteredMissing).mockReturnValue(false);

        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        expect(setMissingOnly).toHaveBeenCalledWith(false);
    });

    it('calls onClick on checkbox click', async () => {
        const onClick = vi.fn();
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
        vi.mocked(useHasMissing).mockReturnValue(false);
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        await user.click(screen.getByRole('checkbox'));

        expect(setMissingOnly).not.toHaveBeenCalled();
    });

    it('does not call onClick when checkbox is disabled', async () => {
        const onClick = vi.fn();
        vi.mocked(useHasMissing).mockReturnValue(false);
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
