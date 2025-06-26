import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockActiveRow } from '@tests/MockActiveRow';
import { MockRedux } from '@tests/MockRedux';
import { SortableVariant } from '~/client/variants/SortableVariant';

describe('<SortableVariant>', () => {
    afterEach(() => jest.clearAllMocks());

    const variant = { group: 'Uogienės', variant: 'd', order: 1, suffix: 'D.' };

    it('renders with details', () => {
        render(
            <MockRedux>
                <SortableVariant index={0} variant={variant} />
            </MockRedux>
        );

        expect(screen.getAllByRole('cell')).toHaveListWithTextContent(['d', 'D.']);
    });

    it('renders with unused class if not used', () => {
        render(
            <MockRedux>
                <SortableVariant index={0} variant={{ ...variant, used: false }} />
            </MockRedux>
        );

        expect(screen.getByRole('row')).toHaveClass('unused');
    });

    it('renders without unused class if is used', () => {
        render(
            <MockRedux>
                <SortableVariant index={0} variant={{ ...variant, used: true }} />
            </MockRedux>
        );

        expect(screen.getByRole('row')).not.toHaveClass('unused');
    });

    describe('dragging', () => {
        const onDragStart = jest.fn();

        it('calls onDragStart on drag start', async () => {
            render(
                <MockRedux>
                    <SortableVariant index={0} variant={variant} onDragStart={onDragStart} />
                </MockRedux>
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, coords: { y: 0 }, keys: '[MouseLeft>]' });

            expect(onDragStart).toHaveBeenCalledWith('d');
        });

        const onDragStop = jest.fn();

        it('calls onDragStop on drag stop', async () => {
            render(
                <MockRedux>
                    <SortableVariant index={0} variant={variant} onDragStop={onDragStop} />
                </MockRedux>
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, keys: '[/MouseLeft]' },
            ]);

            expect(onDragStop).toHaveBeenCalledWith();
        });

        const onDrag = jest.fn();

        it('calls onDrag on drag', async () => {
            render(
                <MockRedux>
                    <SortableVariant index={0} variant={variant} onDrag={onDrag} />
                </MockRedux>
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer([
                { target, coords: { y: 0 }, keys: '[MouseLeft>]' },
                { target, coords: { y: 10 } },
                { target, coords: { y: 20 } },
                { target, keys: '[/MouseLeft]' },
            ]);

            expect(onDrag).toHaveBeenCalledTimes(2);
            expect(onDrag).toHaveBeenCalledWith(expect.any(HTMLDivElement));
        });
    });

    describe('slide controls', () => {
        const setActiveVariant = jest.fn();

        it('renders without controls if not active', async () => {
            render(
                <MockRedux>
                    <MockActiveRow setState={setActiveVariant}>
                        <SortableVariant index={0} variant={variant} />
                    </MockActiveRow>
                </MockRedux>
            );

            expect(screen.queryByRole('group', { name: 'Edit Remove' })).not.toBeInTheDocument();
        });

        it('sets active variant on drag start', async () => {
            render(
                <MockRedux>
                    <MockActiveRow setState={setActiveVariant}>
                        <SortableVariant index={0} variant={variant} />
                    </MockActiveRow>
                </MockRedux>
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
                <MockRedux>
                    <MockActiveRow state={activeVariant} setState={setActiveVariant}>
                        <SortableVariant index={0} variant={variant} />
                    </MockActiveRow>
                </MockRedux>
            );

            expect(screen.getByRole('group', { name: 'Edit Remove' })).toBeInTheDocument();
        });

        it('pins row when interacting with controls', async () => {
            render(
                <MockRedux>
                    <MockActiveRow state={activeVariant} setState={setActiveVariant}>
                        <SortableVariant index={0} variant={variant} />
                    </MockActiveRow>
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));

            expect(setActiveVariant).toHaveBeenCalledWith({ ...activeVariant, pinned: true });
        });

        it('unpins row when interacting with control dialog', async () => {
            render(
                <MockRedux>
                    <MockActiveRow state={activeVariant} setState={setActiveVariant}>
                        <SortableVariant index={0} variant={variant} />
                    </MockActiveRow>
                </MockRedux>
            );
            await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
            await userEvent.click(screen.getByRole('button', { name: 'Close' }));

            expect(setActiveVariant).toHaveBeenCalledWith({ ...activeVariant, pinned: false });
        });

        it('hides controls when dragging by handler', async () => {
            render(
                <MockRedux>
                    <MockActiveRow state={activeVariant} setState={setActiveVariant}>
                        <SortableVariant index={0} variant={variant} />
                    </MockActiveRow>
                </MockRedux>
            );
            const target = screen.getByRole('button', { name: 'Drag' });
            await userEvent.pointer({ target, keys: '[MouseLeft>]' });

            expect(setActiveVariant).toHaveBeenCalledWith(undefined);
        });
    });
});
