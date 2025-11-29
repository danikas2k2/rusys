import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { MissingOnlyCheckbox } from '~/client/pages/products/MissingOnlyCheckbox';
import { useMissingOnly } from '~/client/pages/products/MissingOnlyContext';
import { useHasMissing } from '~/client/state/products/useHasMissing';

vi.mock('~/client/pages/products/MissingOnlyContext', async () => ({
    useMissingOnly: vi.fn(),
}));
vi.mock('~/client/state/products/useHasMissing', async () => ({
    useHasMissing: vi.fn(),
}));

describe('<MissingOnlyCheckbox>', () => {
    const setMissingOnly = vi.fn();

    beforeEach(() => {
        vi.mocked(useMissingOnly).mockReturnValue([false, setMissingOnly]);
        vi.mocked(useHasMissing).mockReturnValue(true);
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
        vi.mocked(useMissingOnly).mockReturnValueOnce([true, setMissingOnly]);
        render(
            <MockTheme>
                <MissingOnlyCheckbox />
            </MockTheme>
        );

        await user.click(screen.getByRole('checkbox'));

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
