import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { expectEvent } from '@tests/matchers';
import { MockThemeActive } from '@tests/MockThemeActive';

import React from 'react';

import { SwipeControls } from '~/components/runtime/SwipeControls';

vi.mock(import('~/features/groups/hooks/useDeleteGroup'));
vi.mock(import('~/components/common/SwipePanel'), (): any => ({
    SwipePanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('<SwipeControls>', () => {
    const setActiveContent = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    afterEach(() => vi.clearAllMocks());

    it('renders control buttons', () => {
        render(
            <MockThemeActive>
                <SwipeControls />
            </MockThemeActive>
        );

        expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('sets the active row to be pinned and editable, and calls onEdit when Edit button is clicked', async () => {
        render(
            <MockThemeActive active={{ data: {} }} setActive={setActiveContent}>
                <SwipeControls onEdit={onEdit} onDelete={onDelete} />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Edit' }));

        expect(onEdit).toHaveBeenCalledWith({}, expectEvent('click'));
        expect(onDelete).not.toHaveBeenCalled();
        expect(setActiveContent).toHaveBeenCalledWith(expect.objectContaining({ action: 'update' }));
    });

    it('set the active row to be pinned when Remove button is clicked (confirmation dialog opens)', async () => {
        render(
            <MockThemeActive active={{ data: {} }} setActive={setActiveContent}>
                <SwipeControls onEdit={onEdit} onDelete={onDelete} />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(onDelete).toHaveBeenCalledWith({}, expectEvent('click'));
        expect(onEdit).not.toHaveBeenCalled();
        expect(setActiveContent).toHaveBeenCalledWith(expect.objectContaining({ action: 'remove' }));
    });

    it('set the active row to be unpinned when remove action is cancelled', async () => {
        render(
            <MockThemeActive active={{ data: {} }} setActive={setActiveContent}>
                <SwipeControls onEdit={onEdit} onDelete={onDelete} />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(onDelete).toHaveBeenCalledWith({}, expectEvent('click'));
        expect(onEdit).not.toHaveBeenCalled();
    });

    it('calls onUnpin and onRemove when Remove is confirmed', async () => {
        render(
            <MockThemeActive active={{ data: {} }} setActive={setActiveContent}>
                <SwipeControls onEdit={onEdit} onDelete={onDelete} />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(onEdit).not.toHaveBeenCalled();
        expect(onDelete).toHaveBeenCalledWith({}, expectEvent('click'));
        expect(setActiveContent).toHaveBeenCalledWith(expect.objectContaining({ action: 'remove' }));
    });

    it('does not call onEdit when Edit button is clicked without data', async () => {
        render(
            <MockThemeActive setActive={setActiveContent}>
                <SwipeControls onEdit={onEdit} onDelete={onDelete} />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Edit' }));

        expect(onEdit).not.toHaveBeenCalled();
        expect(setActiveContent).toHaveBeenCalledWith(expect.objectContaining({ action: 'update' }));
    });

    it('does not call onDelete when Remove button is clicked without data', async () => {
        render(
            <MockThemeActive setActive={setActiveContent}>
                <SwipeControls onEdit={onEdit} onDelete={onDelete} />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(onDelete).not.toHaveBeenCalled();
        expect(setActiveContent).toHaveBeenCalledWith(expect.objectContaining({ action: 'remove' }));
    });

    it('handles Edit button click without onEdit callback', async () => {
        render(
            <MockThemeActive active={{ data: {} }} setActive={setActiveContent}>
                <SwipeControls />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Edit' }));

        expect(setActiveContent).toHaveBeenCalledWith(expect.objectContaining({ action: 'update' }));
    });

    it('handles Remove button click without onDelete callback', async () => {
        render(
            <MockThemeActive active={{ data: {} }} setActive={setActiveContent}>
                <SwipeControls />
            </MockThemeActive>
        );

        await user.click(screen.getByRole('button', { name: 'Remove' }));

        expect(setActiveContent).toHaveBeenCalledWith(expect.objectContaining({ action: 'remove' }));
    });
});
