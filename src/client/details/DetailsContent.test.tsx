import React from 'react';
import { render } from '@testing-library/react';
import { DetailsContent } from '~/client/details/DetailsContent';
import { DetailsTable } from '~/client/details/DetailsTable';
import { MissingOnlyContextWrapper } from '~/client/details/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/details/MissingOnlyEffects';

jest.mock('~/client/details/DetailsTable', () => ({
    DetailsTable: jest.fn(),
}));
jest.mock('~/client/details/MissingOnlyEffects', () => ({
    MissingOnlyEffects: jest.fn(),
}));
jest.mock('~/client/details/MissingOnlyContext', () => {
    const actual = jest.requireActual('~/client/details/MissingOnlyContext');
    return {
        ...actual,
        MissingOnlyContextWrapper: jest.fn(actual.MissingOnlyContextWrapper),
    };
});

describe('<DetailsContent>', () => {
    it('renders into the document', () => {
        render(<DetailsContent />);

        expect(MissingOnlyContextWrapper).toHaveBeenCalledWith(
            { children: [expect.element(), expect.element()] },
            undefined
        );
        expect(MissingOnlyEffects).toHaveBeenCalledWith({}, undefined);
        expect(DetailsTable).toHaveBeenCalledWith({}, undefined);
    });
});
