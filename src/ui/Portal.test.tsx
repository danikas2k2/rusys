import { render, screen } from '@testing-library/react';
import { Portal } from '@ui/Portal';
import React from 'react';

describe('Portal', () => {
    it('renders children in portal', () => {
        render(
            <div>
                <Portal>
                    <div>Test</div>
                </Portal>
            </div>
        );
        const child = screen.getByText('Test');
        expect(child).toBeInTheDocument();
        expect(child.parentElement).toEqual(screen.getByRole('complementary', { name: 'portal' }));
    });

    it('use one portal for one element', () => {
        const { rerender } = render(
            <Portal>
                <div>Initial</div>
            </Portal>
        );
        const initialPortal = screen.getByRole('complementary', { name: 'portal' });
        rerender(
            <Portal>
                <div>Updated</div>
            </Portal>
        );
        expect(initialPortal).toEqual(screen.getByRole('complementary', { name: 'portal' }));
    });

    it('removes portal on unmount', () => {
        const { unmount } = render(
            <Portal>
                <div>Test</div>
            </Portal>
        );
        unmount();
        expect(screen.queryByRole('complementary', { name: 'portal' })).not.toBeInTheDocument();
    });

    it('use different portals for different elements', () => {
        render(
            <>
                <Portal>
                    <div>First</div>
                </Portal>
                <Portal>
                    <div>Second</div>
                </Portal>
            </>
        );
        expect(screen.getAllByRole('complementary', { name: 'portal' })).toHaveLength(2);
    });
});
