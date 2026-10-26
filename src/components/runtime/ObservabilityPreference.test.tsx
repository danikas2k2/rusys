import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { expectNoA11yViolations } from '@tests/accessibility';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import {
    browserPrivacyRequested,
    observabilityConfigured,
    observabilityConsented,
    setObservabilityConsent,
} from '~/lib/observability/faro';
import { ObservabilityPreference } from './ObservabilityPreference';

vi.mock(import('~/lib/observability/faro'), () => ({
    browserPrivacyRequested: vi.fn(),
    observabilityConfigured: vi.fn(),
    observabilityConsented: vi.fn(),
    setObservabilityConsent: vi.fn(),
    subscribeObservability: () => () => {},
}));

describe('optional diagnostics preference', () => {
    beforeEach(() => {
        vi.mocked(observabilityConfigured).mockReturnValue(true);
        vi.mocked(browserPrivacyRequested).mockReturnValue(false);
        vi.mocked(observabilityConsented).mockReturnValue(false);
        vi.mocked(setObservabilityConsent).mockReturnValue(true);
    });

    afterEach(() => vi.clearAllMocks());

    it('offers an unchecked labelled checkbox with a disclosure and keyboard opt-in', async () => {
        render(<ObservabilityPreference />, { wrapper: MockTheme });
        const checkbox = screen.getByRole('checkbox', { name: 'Share optional diagnostics' });

        expect(checkbox).not.toBeChecked();
        expect(checkbox).toHaveAccessibleDescription(/Grafana Cloud/);

        await user.tab();

        expect(checkbox).toHaveFocus();

        await user.keyboard(' ');

        expect(setObservabilityConsent).toHaveBeenCalledExactlyOnceWith(true);

        await expectNoA11yViolations();
    });

    it('allows an opted-in user to revoke consent', async () => {
        vi.mocked(observabilityConsented).mockReturnValue(true);
        render(<ObservabilityPreference />, { wrapper: MockTheme });
        await user.click(screen.getByRole('checkbox', { name: 'Share optional diagnostics' }));

        expect(setObservabilityConsent).toHaveBeenCalledExactlyOnceWith(false);
    });

    it('disables opting in when browser privacy signals are set', async () => {
        vi.mocked(browserPrivacyRequested).mockReturnValue(true);
        render(<ObservabilityPreference />, { wrapper: MockTheme });

        expect(screen.getByRole('checkbox')).toBeDisabled();
        expect(screen.getByText('Diagnostics blocked by your browser privacy preference.')).toBeVisible();

        await expectNoA11yViolations();
    });

    it('disables opting in when collection is not configured', () => {
        vi.mocked(observabilityConfigured).mockReturnValue(false);
        render(<ObservabilityPreference />, { wrapper: MockTheme });

        expect(screen.getByRole('checkbox')).toBeDisabled();
        expect(screen.getByText('Diagnostics are unavailable on this site.')).toBeVisible();
    });

    it('announces failure to persist consent', async () => {
        vi.mocked(setObservabilityConsent).mockReturnValue(false);
        render(<ObservabilityPreference />, { wrapper: MockTheme });
        await user.click(screen.getByRole('checkbox'));

        expect(screen.getByRole('alert')).toHaveTextContent('Could not save your preference. Diagnostics remain off.');

        await expectNoA11yViolations();
    });
});
