import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { PullToRefreshIndicator } from '~/components/runtime/PullToRefreshIndicator';

describe('<PullToRefreshIndicator>', () => {
    it('renders its children', () => {
        render(
            <MockTheme>
                <PullToRefreshIndicator distance={0} refreshing={false} dragging={false}>
                    <div>Content</div>
                </PullToRefreshIndicator>
            </MockTheme>
        );

        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('exposes the pull distance as a CSS variable', () => {
        render(
            <MockTheme>
                <PullToRefreshIndicator distance={42} refreshing={false} dragging={false}>
                    <div />
                </PullToRefreshIndicator>
            </MockTheme>
        );

        expect(document.querySelector('.pull-to-refresh')).toHaveStyle({ '--pull-distance': '42px' });
    });

    it('shows the shared ScreenLoader while a refresh is in progress', () => {
        render(
            <MockTheme>
                <PullToRefreshIndicator distance={60} refreshing dragging={false}>
                    <div />
                </PullToRefreshIndicator>
            </MockTheme>
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not show the ScreenLoader while idle', () => {
        render(
            <MockTheme>
                <PullToRefreshIndicator distance={0} refreshing={false} dragging={false}>
                    <div />
                </PullToRefreshIndicator>
            </MockTheme>
        );

        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('marks the container as dragging while a pull is actively tracked', () => {
        render(
            <MockTheme>
                <PullToRefreshIndicator distance={30} refreshing={false} dragging>
                    <div />
                </PullToRefreshIndicator>
            </MockTheme>
        );

        expect(document.querySelector('.pull-to-refresh')).toHaveAttribute('data-dragging', 'true');
    });

    it('does not mark itself as pulling while idle, so content is not left transformed', () => {
        render(
            <MockTheme>
                <PullToRefreshIndicator distance={0} refreshing={false} dragging={false}>
                    <div />
                </PullToRefreshIndicator>
            </MockTheme>
        );

        // Regression: a permanent transform (even translateY(0px)) on .pull-to-refresh-content
        // turns it into the containing block for any `position: fixed` descendant - which broke
        // the initial-load ScreenLoader's viewport centering. It must only apply while pulling.
        expect(document.querySelector('.pull-to-refresh')).not.toHaveAttribute('data-pulling', 'true');
    });

    it('marks itself as pulling once the drag distance is greater than 0', () => {
        render(
            <MockTheme>
                <PullToRefreshIndicator distance={30} refreshing={false} dragging>
                    <div />
                </PullToRefreshIndicator>
            </MockTheme>
        );

        expect(document.querySelector('.pull-to-refresh')).toHaveAttribute('data-pulling', 'true');
    });

    it('marks itself as pulling while refreshing, so content stays pushed down until it settles', () => {
        render(
            <MockTheme>
                <PullToRefreshIndicator distance={60} refreshing dragging={false}>
                    <div />
                </PullToRefreshIndicator>
            </MockTheme>
        );

        expect(document.querySelector('.pull-to-refresh')).toHaveAttribute('data-pulling', 'true');
    });
});
