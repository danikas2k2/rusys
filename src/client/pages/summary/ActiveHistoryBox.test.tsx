import { render } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ActiveHistoryBox } from '~/client/pages/summary/ActiveHistoryBox';
import type { SummaryHistoryData } from '~/client/pages/summary/SummaryCell';
import { SummaryHistoryBox } from '~/client/pages/summary/SummaryHistoryBox';
import { SummaryYear } from '~/client/pages/summary/SummaryYear';

vi.mock(import('~/client/pages/summary/SummaryHistoryBox'), () => ({
    SummaryHistoryBox: vi.fn(() => null),
}));

vi.mock(import('~/client/common/AmountTitle'), () => ({
    AmountTitle: vi.fn(() => null),
}));

vi.mock(import('~/client/pages/summary/SummaryYear'), () => ({
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
            data: { group: 'G', name: 'N', year: 2023, amounts: [] } as SummaryHistoryData,
        };
        render(
            <MockThemeActive active={active}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        expect(getLastProps()).toMatchObject({ opened: false });
    });

    it('renders with opened=true when active.action is "history" and data is present', () => {
        const activeData: SummaryHistoryData = { group: 'G', name: 'N', year: 2023, amounts: [] };
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
        const activeData: SummaryHistoryData = { group: 'G', name: 'N', year: 2023, amounts: [] };
        const active = { action: 'history' as const, data: activeData };

        render(
            <MockThemeActive active={active} setActive={setActive}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        const { onClose } = getLastProps();
        onClose();

        expect(setActive).toHaveBeenCalledWith({ data: activeData });
    });

    it('afterClose callback calls setActive with no arguments', () => {
        const setActive = vi.fn();
        const activeData: SummaryHistoryData = { group: 'G', name: 'N', year: 2023, amounts: [] };
        const active = { action: 'history' as const, data: activeData };

        render(
            <MockThemeActive active={active} setActive={setActive}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        const { onAfterClose } = getLastProps();
        onAfterClose();

        expect(setActive).toHaveBeenCalledWith();
    });

    it('passes undefined as year to AmountTitle title prop when activeData.year is 0', () => {
        const activeData = { group: 'G', name: 'N', year: 0, amounts: [] } as SummaryHistoryData;
        const active = { action: 'history' as const, data: activeData };

        render(
            <MockThemeActive active={active}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        // title is <AmountTitle year={undefined} .../>; year=0 is falsy
        const { title } = getLastProps();
        const yearProp = (title as React.ReactElement<{ year?: unknown }>).props?.year;

        expect(yearProp).toBeUndefined();
    });

    it('passes a SummaryYear element as year prop in AmountTitle when activeData.year is non-zero', () => {
        const activeData: SummaryHistoryData = { group: 'G', name: 'N', year: 2023, amounts: [] };
        const active = { action: 'history' as const, data: activeData };

        render(
            <MockThemeActive active={active}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        // title is <AmountTitle year={<SummaryYear year={2023} />} .../>
        const { title } = getLastProps();
        const yearProp = (title as React.ReactElement<{ year?: unknown }>).props?.year;

        expect(yearProp).toBeDefined();
        expect((yearProp as React.ReactElement).type).toBe(SummaryYear);
        expect((yearProp as React.ReactElement<{ year: unknown }>).props.year).toBe(2023);
    });
});
