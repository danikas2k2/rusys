import { render, screen } from '@testing-library/react';
import { getDetailsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { useGroupFilter } from '~/client/filters/hooks/useGroupFilter';
import { DetailsGroups } from '~/client/pages/details/DetailsGroups';
import { ValueRow } from '~/client/pages/details/ValueRow';

jest.mock('~/client/filters/hooks/useGroupFilter', () => ({
    useGroupFilter: jest.fn().mockReturnValue(''),
}));
jest.mock('~/client/pages/details/ValueRow', () => ({
    ValueRow: jest.fn().mockReturnValue(null),
}));

describe('<DetailsGroups>', () => {
    const groups = ['Uogienės', 'Daržovės'];
    const details = getDetailsFixture();

    afterEach(() => jest.clearAllMocks());

    it('renders details groups with groups and details', () => {
        render(
            <MockRedux>
                <DetailsGroups groups={groups} details={details} />
            </MockRedux>
        );

        expect(screen.getAllByRole('rowgroup')).toHaveLength(2);
        expect(screen.getAllByRole('rowheader')).toHaveListWithTextContent(groups);

        expect(ValueRow)
            .toHaveBeenCalledTimes(4)
            .toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
                }),
                undefined
            )
            .toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    group: 'Uogienės',
                    name: 'Braškės',
                    missing: true,
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
                }),
                undefined
            )
            .toHaveBeenNthCalledWith(
                3,
                expect.objectContaining({
                    group: 'Daržovės',
                    name: 'Agurkai',
                    years: [{ year: 22, amounts: [{ variant: 'd', amount: 1 }] }],
                }),
                undefined
            )
            .toHaveBeenNthCalledWith(
                4,
                expect.objectContaining({
                    group: 'Daržovės',
                    name: 'Kopūstai',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }], removing: true }],
                }),
                undefined
            );
    });

    it('renders filtered groups with details', () => {
        const [group] = groups;
        jest.mocked(useGroupFilter).mockReturnValue(group);
        render(
            <MockRedux>
                <DetailsGroups groups={[group]} details={details} />
            </MockRedux>
        );

        expect(screen.getByRole('rowgroup')).toBeInTheDocument();
        expect(screen.getByRole('rowheader')).toHaveTextContent(group);

        expect(ValueRow)
            .toHaveBeenCalledTimes(2)
            .toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    group: 'Uogienės',
                    name: 'Avietės',
                    years: [{ year: 21, amounts: [{ variant: 'p', amount: 2 }] }],
                }),
                undefined
            )
            .toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    group: 'Uogienės',
                    name: 'Braškės',
                    missing: true,
                    years: [{ year: 22, amounts: [{ variant: 'p', amount: 2 }] }],
                }),
                undefined
            );
    });

    const missing = 'Šaldytos';

    it('renders missing group without details', () => {
        render(
            <MockRedux>
                <DetailsGroups groups={[missing]} details={details} />
            </MockRedux>
        );

        expect(screen.queryByRole('rowgroup')).not.toBeInTheDocument();
        expect(screen.queryByRole('rowheader')).not.toBeInTheDocument();
        expect(ValueRow).not.toHaveBeenCalled();
    });

    it('renders missing filtered group without details', () => {
        jest.mocked(useGroupFilter).mockReturnValue(missing);
        render(
            <MockRedux>
                <DetailsGroups groups={[missing]} details={details} />
            </MockRedux>
        );

        expect(screen.getByRole('rowgroup')).toBeInTheDocument();
        expect(screen.getByRole('rowheader')).toHaveTextContent(missing);
        expect(ValueRow).not.toHaveBeenCalled();
    });
});
