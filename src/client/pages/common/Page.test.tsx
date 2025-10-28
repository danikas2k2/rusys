import { render, screen } from '@testing-library/react';
import { MockRoute } from '@tests/MockRoute';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { Page } from '~/client/pages/common/Page';

jest.mock('~/client/toolbar/Toolbar', () => ({
    Toolbar: jest.fn(({ children }) => <div role="toolbar">{children}</div>),
}));

describe('<Page>', () => {
    it('renders content and default toolbar', () => {
        render(
            <MockTheme>
                <MockRoute>
                    <Page>content</Page>
                </MockRoute>
            </MockTheme>
        );

        expect(screen.getByText('content')).toBeInTheDocument();
        expect(screen.getByRole('toolbar')).toBeEmptyDOMElement();
    });

    it('renders content and customized toolbar', () => {
        render(
            <MockTheme>
                <MockRoute>
                    <Page toolbar="toolbar">content</Page>
                </MockRoute>
            </MockTheme>
        );

        expect(screen.getByText('content')).toBeInTheDocument();
        expect(screen.getByRole('toolbar')).toHaveTextContent('toolbar');
    });
});
