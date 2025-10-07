import { render } from '@testing-library/react';

import React from 'react';

import { DetailsContent } from '~/client/app/details/DetailsContent';
import { DetailsTable } from '~/client/app/details/DetailsTable';
import { MissingOnlyContextWrapper } from '~/client/app/details/MissingOnlyContext';
import { MissingOnlyEffects } from '~/client/app/details/MissingOnlyEffects';

jest.mock('~/client/app/details/DetailsTable', () => ({
    DetailsTable: jest.fn(),
}));
jest.mock('~/client/app/details/MissingOnlyEffects', () => ({
    MissingOnlyEffects: jest.fn(),
}));
jest.mock('~/client/app/details/MissingOnlyContext', () => {
    const actual = jest.requireActual('~/client/app/details/MissingOnlyContext');
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
