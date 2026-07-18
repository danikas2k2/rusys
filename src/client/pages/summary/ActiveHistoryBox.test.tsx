import { render } from '@testing-library/react';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { ActiveHistoryBox } from '~/client/pages/summary/ActiveHistoryBox';
import type { SummaryHistoryData } from '~/client/pages/summary/SummaryCell';

jest.mock('~/client/pages/summary/SummaryHistoryBox', () => ({
    SummaryHistoryBox: jest.fn(() => null),
}));

jest.mock('~/client/common/AmountTitle', () => ({
    AmountTitle: jest.fn(() => null),
}));

jest.mock('~/client/pages/summary/SummaryYear', () => ({
    SummaryYear: jest.fn(() => null),
}));

describe('<ActiveHistoryBox>', () => {
    const { SummaryHistoryBox } = jest.requireMock('~/client/pages/summary/SummaryHistoryBox');
    const { SummaryYear } = jest.requireMock('~/client/pages/summary/SummaryYear');

    afterEach(() => jest.clearAllMocks());

    function getLastProps() {
        return SummaryHistoryBox.mock.calls[SummaryHistoryBox.mock.calls.length - 1][0];
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
        const active = { action: 'update' as const, data: { group: 'G', name: 'N', year: 2023, amounts: [], updateType: 'consumed' as const } };
        render(
            <MockThemeActive active={active}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        expect(getLastProps()).toMatchObject({ opened: false });
    });

    it('renders with opened=true when active.action is "history" and data is present', () => {
        const activeData: SummaryHistoryData = { group: 'G', name: 'N', year: 2023, amounts: [], updateType: 'consumed' };
        const active = { action: 'history' as const, data: activeData };

        render(
            <MockThemeActive active={active}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        expect(getLastProps()).toMatchObject({ opened: true });
    });

    it('close callback calls setActive with data but no action', () => {
        const setActive = jest.fn();
        const activeData: SummaryHistoryData = { group: 'G', name: 'N', year: 2023, amounts: [], updateType: 'consumed' };
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
        const setActive = jest.fn();
        const activeData: SummaryHistoryData = { group: 'G', name: 'N', year: 2023, amounts: [], updateType: 'consumed' };
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

    it('passes initialUpdateType from activeData.updateType', () => {
        const activeData: SummaryHistoryData = { group: 'G', name: 'N', year: 2023, amounts: [], updateType: 'recycled' };
        const active = { action: 'history' as const, data: activeData };

        render(
            <MockThemeActive active={active}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        expect(getLastProps()).toMatchObject({ initialUpdateType: 'recycled' });
    });

    it('passes undefined as year to AmountTitle title prop when activeData.year is 0', () => {
        const activeData = { group: 'G', name: 'N', year: 0, amounts: [], updateType: 'consumed' as const };
        const active = { action: 'history' as const, data: activeData };

        render(
            <MockThemeActive active={active}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        // title is <AmountTitle year={undefined} .../>; year=0 is falsy
        const { title } = getLastProps();
        const yearProp = (title as React.ReactElement).props?.year;
        expect(yearProp).toBeUndefined();
    });

    it('passes a SummaryYear element as year prop in AmountTitle when activeData.year is non-zero', () => {
        const activeData: SummaryHistoryData = { group: 'G', name: 'N', year: 2023, amounts: [], updateType: 'consumed' };
        const active = { action: 'history' as const, data: activeData };

        render(
            <MockThemeActive active={active}>
                <ActiveHistoryBox />
            </MockThemeActive>
        );

        // title is <AmountTitle year={<SummaryYear year={2023} />} .../>
        const { title } = getLastProps();
        const yearProp = (title as React.ReactElement).props?.year;
        expect(yearProp).toBeDefined();
        expect((yearProp as React.ReactElement).type).toBe(SummaryYear);
        expect((yearProp as React.ReactElement).props.year).toBe(2023);
    });
});
