import React from 'react';
import { render, screen } from '@testing-library/react';
import { SortableGroup } from '~/client/variants/SortableGroup';
import { SortableVariants } from '~/client/variants/SortableVariants';
import { useFilter } from '~/state/filter/useFilter';

jest.mock('~/state/filter/useFilter');
jest.mock('~/state/variants/useGroupVariants');
jest.mock('~/client/variants/SortableVariants', () => ({
    SortableVariants: jest.fn(() => null),
}));

describe('<SortableGroup>', () => {
    afterEach(() => jest.clearAllMocks());

    const group = 'Uogienės';

    it('renders with details', () => {
        render(<SortableGroup group={group} />);

        expect(screen.getByRole('rowheader')).toHaveTextContent(group);
        expect(SortableVariants).toHaveBeenCalledWith(
            expect.objectContaining({
                group,
                variants: [
                    expect.objectContaining({ group, variant: 'p' }),
                    expect.objectContaining({ group, variant: 'd' }),
                    expect.objectContaining({ group, variant: 'm' }),
                    expect.objectContaining({ group, variant: 'e' }),
                    expect.objectContaining({ group, variant: 'x' }),
                ],
            }),
            undefined
        );
    });

    it('renders with filtered details', () => {
        jest.mocked(useFilter).mockReturnValue('d');
        render(<SortableGroup group={group} />);

        expect(screen.getByRole('rowheader')).toHaveTextContent(group);
        expect(SortableVariants).toHaveBeenCalledWith(
            expect.objectContaining({
                group,
                variants: [expect.objectContaining({ group, variant: 'd' })],
            }),
            undefined
        );
    });

    it('renders without filtered out details', () => {
        jest.mocked(useFilter).mockReturnValue('a');
        render(<SortableGroup group={group} />);

        expect(screen.queryByRole('rowheader')).not.toBeInTheDocument();
        expect(SortableVariants).not.toHaveBeenCalled();
    });
});
