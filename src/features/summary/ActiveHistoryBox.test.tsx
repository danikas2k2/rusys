import { render } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ActiveHistoryBox } from '~/features/summary/ActiveHistoryBox';
import { SummaryHistoryBox } from '~/features/summary/SummaryHistoryBox';
import type { ProductAmounts } from '~/schema';

vi.mock(import('~/features/summary/SummaryHistoryBox'), () => ({
    SummaryHistoryBox: vi.fn(() => null),
}));

vi.mock(import('~/components/amounts/AmountTitle'), () => ({
    AmountTitle: vi.fn(() => null),
}));

vi.mock(import('~/features/summary/SummaryYear'), () => ({
    SummaryYear: vi.fn(() => null),
}));

describe('<ActiveHistoryBox>', () => {
    afterEach(() => vi.clearAllMocks());

    function getLastProps() {
        const calls = vi.mocked(SummaryHistoryBox).mock.calls;
        return calls[calls.length - 1][0];
    }

    it('renders with opened=false when there is no active content', () => {
        render(
            <MockThemeActive>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        expect(getLastProps()).toMatchObject({ opened: false });
    });

    it('renders with opened=false when active.action is not "history"', () => {
        const active = {
            action: 'update' as const,
            data: { group: 'G', name: 'N', year: 2023, amounts: [] } as ProductAmounts,
        };
        render(
            <MockThemeActive active={active}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        expect(getLastProps()).toMatchObject({ opened: false });
    });

    it('renders with opened=true when active.action is "history" and data is present', () => {
        const activeData: ProductAmounts = { group: 'G', name: 'N', year: 2023, amounts: [] };
        const active = { action: 'history' as const, data: activeData };

        render(
            <MockThemeActive active={active}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        expect(getLastProps()).toMatchObject({ opened: true });
    });

    it('close callback calls setActive with data but no action', () => {
        const setActive = vi.fn();
        const activeData: ProductAmounts = { group: 'G', name: 'N', year: 2023, amounts: [] };
        const active = { action: 'history' as const, data: activeData };

        render(
            <MockThemeActive active={active} setActive={setActive}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        const { onClose } = getLastProps();
        onClose!();

        expect(setActive).toHaveBeenCalledWith({ data: activeData });
    });

    it('afterClose callback calls setActive with no arguments', () => {
        const setActive = vi.fn();
        const activeData: ProductAmounts = { group: 'G', name: 'N', year: 2023, amounts: [] };
        const active = { action: 'history' as const, data: activeData };

        render(
            <MockThemeActive active={active} setActive={setActive}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        const { onAfterClose } = getLastProps();
        onAfterClose!();

        expect(setActive).toHaveBeenCalledWith();
    });
});
