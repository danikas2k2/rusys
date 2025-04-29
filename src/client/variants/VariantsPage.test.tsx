import React from 'react';
import { render, screen } from '@testing-library/react';
import { withMany } from '@tests/withMany';
import { withReduxState } from '@tests/withReduxState';
import { withRouter } from '@tests/withRouter';
import { VariantsPage } from './VariantsPage';

jest.mock('~/client/variants/VariantsTable', () => ({
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
        render(<VariantsPage />, withMany(withRouter(), withReduxState()));

        expect(screen.getByText('VariantsTable')).toBeInTheDocument();
    });

    it('renders toolbar filters', async () => {
        render(<VariantsPage />, withMany(withRouter(), withReduxState()));

        expect(screen.getByText('ToolbarFilter')).toBeInTheDocument();
        expect(screen.getByText('ToolbarGroupFilter')).toBeInTheDocument();
    });
});
