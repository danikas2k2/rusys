import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Links } from '~/client/Links';
import ToolbarMenu from '~/client/toolbar/ToolbarMenu';

jest.mock('~/client/toolbar/DetailsMenu', () => () => <div>DetailsMenu</div>);
jest.mock('~/client/toolbar/SummaryMenu', () => () => <div>SummaryMenu</div>);

describe('ToolbarMenu', () => {
    it('renders DetailsMenu when on details page', () => {
        render(
            <MemoryRouter initialEntries={[Links.DETAILS]}>
                <Routes>
                    <Route path="*" element={<ToolbarMenu />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('DetailsMenu')).toBeInTheDocument();
    });

    it('renders SummaryMenu when on summary page', () => {
        render(
            <MemoryRouter initialEntries={[Links.SUMMARY]}>
                <Routes>
                    <Route path="*" element={<ToolbarMenu />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('SummaryMenu')).toBeInTheDocument();
    });

    it('renders nothing when on an unknown page', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/unknown']}>
                <Routes>
                    <Route path="*" element={<ToolbarMenu />} />
                </Routes>
            </MemoryRouter>
        );

        expect(container).toBeEmptyDOMElement();
    });
});
