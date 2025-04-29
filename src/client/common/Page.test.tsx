import React from 'react';
import { render, screen } from '@testing-library/react';
import { Page } from '~/client/common/Page';

jest.mock('~/client/toolbar/Toolbar', () => ({
    Toolbar: jest.fn(({ children }) => <div role="toolbar">{children}</div>),
}));

describe('<Page>', () => {
    it('renders content and default toolbar', () => {
        render(<Page>content</Page>);

        expect(screen.getByText('content')).toBeInTheDocument();
        expect(screen.getByRole('toolbar')).toBeEmptyDOMElement();
    });

    it('renders content and customized toolbar', () => {
        render(<Page toolbar="toolbar">content</Page>);

        expect(screen.getByText('content')).toBeInTheDocument();
        expect(screen.getByRole('toolbar')).toHaveTextContent('toolbar');
    });
});
