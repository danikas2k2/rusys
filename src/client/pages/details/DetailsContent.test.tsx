import { render } from '@testing-library/react';

import React from 'react';

import { DetailsContent } from '~/client/pages/details/DetailsContent';
import { DetailsTable } from '~/client/pages/details/DetailsTable';
import { MissingOnlyContextWrapper } from '~/client/pages/details/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/pages/details/MissingOnlyEffects';

jest.mock('~/client/pages/details/DetailsTable', () => ({
    DetailsTable: jest.fn(),
}));
jest.mock('~/client/pages/details/MissingOnlyEffects', () => ({
    MissingOnlyEffects: jest.fn(),
}));
jest.mock('~/client/pages/details/MissingOnlyContext', () => {
    const actual = jest.requireActual('~/client/pages/details/MissingOnlyContext');
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
