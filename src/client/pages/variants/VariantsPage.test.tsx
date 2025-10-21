import { render, screen } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';
import { MockRoute } from '@tests/MockRoute';

import React from 'react';

import { VariantsPage } from './VariantsPage';

jest.mock('~/client/pages/variants/VariantsTable', () => ({
    VariantsTable: () => <div>VariantsTable</div>,
}));
jest.mock('~/client/toolbar/ToolbarFilter', () => ({
    ToolbarFilter: () => <div>ToolbarFilter</div>,
}));
jest.mock('~/client/toolbar/ToolbarGroupFilter', () => ({
    ToolbarGroupFilter: () => <div>ToolbarGroupFilter</div>,
}));

describe('<VariantsPage>', () => {
    it('renders variant table', async () => {
        render(
            <MockRedux>
                <MockRoute>
                    <VariantsPage />
                </MockRoute>
            </MockRedux>
        );

        expect(screen.getByText('VariantsTable')).toBeInTheDocument();
    });

    it('renders toolbar filters', async () => {
        render(
            <MockRedux>
                <MockRoute>
                    <VariantsPage />
                </MockRoute>
            </MockRedux>
        );

        expect(screen.getByText('ToolbarFilter')).toBeInTheDocument();
        expect(screen.getByText('ToolbarGroupFilter')).toBeInTheDocument();
    });
});
