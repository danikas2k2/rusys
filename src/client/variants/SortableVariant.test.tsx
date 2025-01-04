import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { SortableVariant } from '~/client/variants/SortableVariant';
import { withActiveRowContext } from '~/tests/withActiveRowContext';
import { withMany } from '~/tests/withMany';
import { withReduxState } from '~/tests/withReduxState';

describe('SortableVariant', () => {
    afterEach(() => jest.clearAllMocks());

    const variant = { group: 'Uogienės', variant: 'd', order: 1, long: '750 ml.', short: 'D.' };
    const redux = withReduxState();

    it('renders with details', () => {
        render(<SortableVariant index={0} variant={variant} />, redux);
        expect(screen.getAllByRole('cell')).toHaveListWithTextContent(['d', '750 ml.', 'D.']);
    });

    it('renders with unused class if not used', () => {
        render(<SortableVariant index={0} variant={{ ...variant, used: false }} />, redux);
        expect(screen.getByRole('row')).toHaveClass('unused');
    });

    it('renders without unused class if is used', () => {
        render(<SortableVariant index={0} variant={{ ...variant, used: true }} />, redux);
        expect(screen.getByRole('row')).not.toHaveClass('unused');
    });

    describe('dragging', () => {
        const onDragStart = jest.fn();

        it('calls onDragStart on drag start', async () => {
            render(<SortableVariant index={0} variant={variant} onDragStart={onDragStart} />, redux);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, coords: { y: 0 }, keys: '[MouseLeft>]' });
            expect(onDragStart).toHaveBeenCalledWith('d');
        });

        const onDragStop = jest.fn();

        it('calls onDragStop on drag stop', async () => {
            render(<SortableVariant index={0} variant={variant} onDragStop={onDragStop} />, redux);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 0 }, keys: '[/MouseLeft]' },
            ]);
            expect(onDragStop).toHaveBeenCalledWith();
        });

        const onDrag = jest.fn();

        it('calls onDrag on drag', async () => {
            render(<SortableVariant index={0} variant={variant} onDrag={onDrag} />, redux);
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 10 } },
                { target, coords: { y: 20 }, keys: '[/MouseLeft]' },
            ]);
            expect(onDrag).toHaveBeenCalledTimes(2);
            expect(onDrag).toHaveBeenCalledWith(expect.any(HTMLDivElement));
        });
    });

    describe('slide controls', () => {
        const setActiveVariant = jest.fn();

        it('renders without controls if not active', async () => {
            render(
                <SortableVariant index={0} variant={variant} />,
                withMany(redux, withActiveRowContext(undefined, setActiveVariant))
            );
            expect(screen.queryByRole('group', { name: 'Edit Remove' })).not.toBeInTheDocument();
        });

        it('sets active variant on drag start', async () => {
            render(
                <SortableVariant index={0} variant={variant} />,
                withMany(redux, withActiveRowContext(undefined, setActiveVariant))
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, coords: { y: 0 }, keys: '[MouseLeft>]' });
            expect(setActiveVariant).toHaveBeenCalledWith({ group: 'Uogienės', variant: 'd', ref: expect.any(Object) });
        });

        const activeVariant = {
            group: 'Uogienės',
            variant: 'd',
            ref: { current: null },
        };

        it('renders controls when variant is active', () => {
            render(
                <SortableVariant index={0} variant={variant} />,
                withMany(redux, withActiveRowContext(activeVariant, setActiveVariant))
            );
            expect(screen.getByRole('group', { name: 'Edit Remove' })).toBeInTheDocument();
        });

        it('pins row when interacting with controls', async () => {
            render(
                <SortableVariant index={0} variant={variant} />,
                withMany(redux, withActiveRowContext(activeVariant, setActiveVariant))
            );
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
            expect(setActiveVariant).toHaveBeenCalledWith({ ...activeVariant, pinned: true });
        });

        it('unpins row when interacting with control dialog', async () => {
            render(
                <SortableVariant index={0} variant={variant} />,
                withMany(redux, withActiveRowContext(activeVariant, setActiveVariant))
            );
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
            await userEvent.click(screen.getByRole('button', { name: 'Close' }));
            expect(setActiveVariant).toHaveBeenCalledWith({ ...activeVariant, pinned: false });
        });

        it('hides controls when dragging by handler', async () => {
            render(
                <SortableVariant index={0} variant={variant} />,
                withMany(redux, withActiveRowContext(activeVariant, setActiveVariant))
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, keys: '[MouseLeft>]' });
            expect(setActiveVariant).toHaveBeenCalledWith(undefined);
        });
    });
});
