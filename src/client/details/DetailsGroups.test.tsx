import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { useFilteredList } from '~/client/common/hooks/useFilteredList';
import { LoadingState, useLockingLoader } from '~/client/common/hooks/useLockingLoader';
import { DetailsGroups } from '~/client/details/DetailsGroups';
import { useDetailsHasData } from '~/client/details/hooks/useDetailsHasData';
import { useGroup } from '~/state/group/useGroup';
import { getDetailsFixture, getGroupsFixture, getVariantsFixture, getYearsFixture } from '~/tests/fixtures';
import { withReduxState } from '~/tests/withReduxState';
import { ValueRow } from '~/client/details/ValueRow';

jest.mock('~/state/years/useYears');
jest.mock('~/client/common/hooks/useFilteredList', () => ({
    useFilteredList: jest.fn(),
}));
jest.mock('~/client/details/hooks/useDetailsHasData', () => ({
    useDetailsHasData: jest.fn().mockReturnValue(true),
}));
jest.mock('~/client/details/MissingOnlyContext', () => ({
    useMissingOnly: jest.fn().mockReturnValue([false, jest.fn()]),
}));
jest.mock('~/client/common/hooks/useLockingLoader', () => ({
    ...jest.requireActual('~/client/common/hooks/useLockingLoader'),
    useLockingLoader: jest.fn(),
}));
jest.mock('~/state/filter/useFilter', () => ({
    useFilter: jest.fn().mockReturnValue(''),
}));
jest.mock('~/state/filter/useClearFilter', () => ({
    useClearFilter: jest.fn(),
}));
jest.mock('~/state/group/useGroup', () => ({
    useGroup: jest.fn().mockReturnValue(''),
}));
jest.mock('~/client/details/MissingOnlyCheckbox', () => ({
    MissingOnlyCheckbox: jest.fn(({ onClick }: { onClick: () => void }) => <input type="checkbox" onClick={onClick} />),
}));
jest.mock('~/client/details/ValueRow', () => ({
    ValueRow: jest.fn().mockReturnValue(null),
}));

describe('DetailsGroups', () => {
    const groups = ['Uogienės', 'Daržovės'];
    const details = getDetailsFixture();
    const state = {
        years: getYearsFixture(),
        groups: getGroupsFixture(),
        variants: getVariantsFixture(),
        details,
    };

    beforeAll(() => {
        (useLockingLoader as jest.Mock).mockReturnValue(LoadingState.COMPLETE);
        (useFilteredList as jest.Mock).mockReturnValue(details);
    });

    afterEach(() => jest.clearAllMocks());

    it('renders details group for complete state with data', () => {
        render(<DetailsGroups groups={groups} details={details} />);
        expect(screen.getAllByRole('rowgroup')).toHaveLength(2);
        expect(screen.getAllByRole('rowheader')).toHaveListWithTextContent(groups);

        expect(ValueRow).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                group: 'Uogienės',
                name: 'Avietės',
                years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
            }),
            {}
        );
        expect(ValueRow).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                group: 'Uogienės',
                name: 'Braškės',
                missing: true,
                years: [{ year: 22, amounts: [{ variant: 'p', amount: 1 }] }],
            }),
            {}
        );
        expect(ValueRow).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                group: 'Daržovės',
                name: 'Agurkai',
                years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }],
            }),
            {}
        );
        expect(ValueRow).toHaveBeenNthCalledWith(
            4,
            expect.objectContaining({
                group: 'Daržovės',
                name: 'Kopūstai',
                years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
            }),
            {}
        );
    });

    it('renders table for complete state with data filtered-out', () => {
        (useFilteredList as jest.Mock).mockReturnValueOnce([]);
        render(<DetailsGroups groups={groups} details={details} />, withReduxState(state));
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(DetailsGroups).toHaveBeenCalledWith({ groups: [], details: [] }, {});
    });

    it('renders table with group selected', () => {
        (useGroup as jest.Mock).mockReturnValueOnce('Uogienės');
        render(<DetailsGroups groups={groups} details={details} />, withReduxState(state));
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(DetailsGroups).toHaveBeenCalledWith({ groups: ['Uogienės'], details: expect.any(Array) }, {});
    });

    it('does not render table for initial state', () => {
        (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.INITIAL);
        render(<DetailsGroups groups={groups} details={details} />, withReduxState(state));
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('does not render table for loading state', () => {
        (useLockingLoader as jest.Mock).mockReturnValueOnce(LoadingState.LOADING);
        render(<DetailsGroups groups={groups} details={details} />, withReduxState(state));
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('does not render table for complete state without data', () => {
        (useDetailsHasData as jest.Mock).mockReturnValueOnce(false);
        render(<DetailsGroups groups={groups} details={details} />, withReduxState(state));
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
});
