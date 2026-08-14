import { act, fireEvent, render, screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { getGroupsFixture } from '@tests/fixtures';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { GroupBox } from '~/client/pages/groups/GroupBox';
import { useRenameGroup } from '~/client/state/groups/useRenameGroup';
import { useUpdateGroup } from '~/client/state/groups/useUpdateGroup';

vi.mock(import('~/client/common/Label'));
vi.mock(import('~/client/state/groups/useRenameGroup'));
vi.mock(import('~/client/state/groups/useUpdateGroup'));
vi.mock(import('@mantine/dropzone'), (): any => {
    const DropzoneComponent = ({
        onDrop,
        onReject,
        children,
    }: {
        onDrop: (files: File[]) => void;
        onReject?: (fileRejections: unknown[]) => void;
        children: React.ReactNode;
    }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                onDrop(Array.from(e.target.files));
            }
        };
        const handleReject = () => {
            onReject?.([{ file: new File([], 'x'), errors: [{ code: 'file-invalid-type', message: 'Invalid type' }] }]);
        };
        return (
            <div>
                <input type="file" placeholder="Please choose an image" onChange={handleChange} />
                <button type="button" onClick={handleReject} aria-label="Reject image">
                    Reject
                </button>
                {children}
            </div>
        );
    };

    DropzoneComponent.Accept = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
    DropzoneComponent.Reject = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
    DropzoneComponent.Idle = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;

    return { Dropzone: DropzoneComponent };
});

describe('<GroupBox>', () => {
    afterEach(() => vi.clearAllMocks());

    const state = {
        groups: getGroupsFixture(),
    };

    const onClose = vi.fn();

    it('does not render when opened=false', () => {
        render(
            <MockApp state={state}>
                <GroupBox onClose={onClose} />
            </MockApp>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders with cancel button', () => {
        render(
            <MockApp state={state}>
                <GroupBox opened onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders without initial value', () => {
        render(
            <MockApp state={state}>
                <GroupBox opened onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('heading', { name: 'Add new category' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Category name' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });

    it('renders with initial name', () => {
        render(
            <MockApp state={state}>
                <GroupBox opened group="Initial Group" onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('heading', { name: 'Edit category' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Category name' })).toHaveValue('Initial Group');
        expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('shows icon-only removal only while editing and calls its handler', async () => {
        const onDelete = vi.fn();
        const { rerender } = render(
            <MockApp state={state}>
                <GroupBox opened onClose={onClose} onDelete={onDelete} />
            </MockApp>
        );

        expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();

        rerender(
            <MockApp state={state}>
                <GroupBox opened group="Daržovės" onClose={onClose} onDelete={onDelete} />
            </MockApp>
        );
        const remove = screen.getByRole('button', { name: 'Remove' });

        expect(remove).not.toHaveTextContent('Remove');

        await user.click(remove);

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('renders with the review checkbox checked when initially true', () => {
        render(
            <MockApp state={state}>
                <GroupBox opened group="Initial Group" review onClose={onClose} />
            </MockApp>
        );

        expect(screen.getByRole('checkbox', { name: /Review/ })).toBeChecked();
    });

    describe('image upload', () => {
        it('does not render a remove button when no image is set', () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            expect(screen.queryByRole('button', { name: 'Remove image' })).not.toBeInTheDocument();
        });

        it('shows a preview and remove button after dropping a valid image', async () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
            const file = new File(['image-data'], 'image.png', { type: 'image/png' });
            await user.upload(imageInput, file);

            await expect(screen.findByRole('button', { name: 'Remove image' })).resolves.toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('falls back to a photo icon when the preview image fails to load', async () => {
            const { container } = render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
            const file = new File(['image-data'], 'image.png', { type: 'image/png' });
            await user.upload(imageInput, file);
            await screen.findByRole('button', { name: 'Remove image' });

            fireEvent.error(container.querySelector('img')!);

            expect(container.querySelector('.tabler-icon-photo')).toBeInTheDocument();
        });

        it('shows an error when the dropped file is rejected', async () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Reject image' }));

            expect(screen.getByRole('alert')).toHaveTextContent('Choose a valid image file');
        });

        it('removes the image when the remove button is clicked', async () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
            const file = new File(['image-data'], 'image.png', { type: 'image/png' });
            await user.upload(imageInput, file);

            await user.click(await screen.findByRole('button', { name: 'Remove image' }));

            expect(screen.queryByRole('button', { name: 'Remove image' })).not.toBeInTheDocument();
        });

        it('sends the uploaded image when adding a new category', async () => {
            const addGroup = vi.fn().mockResolvedValue(true);
            vi.mocked(useUpdateGroup).mockReturnValue(addGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox', { name: 'Category name' }), 'Buitinė chemija');

            const imageInput = screen.getByPlaceholderText<HTMLInputElement>('Please choose an image');
            const file = new File(['image-data'], 'image.png', { type: 'image/png' });
            await user.upload(imageInput, file);
            await screen.findByRole('button', { name: 'Remove image' });

            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).toHaveBeenCalledWith(
                'Buitinė chemija',
                true,
                false,
                expect.stringMatching(/^data:image\/png;base64,/)
            );
        });
    });

    it('calls onClose when close button is clicked', async () => {
        render(
            <MockApp state={state}>
                <GroupBox opened onClose={onClose} />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    describe('discard confirmation', () => {
        it('closes without confirmation when the form is untouched', async () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(onClose).toHaveBeenCalledWith();
            expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
        });

        it('asks for confirmation instead of closing when the form was changed', async () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox', { name: 'Category name' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
        });

        it('closes after confirming discard', async () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox', { name: 'Category name' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            await user.click(screen.getByRole('button', { name: 'Discard' }));

            expect(onClose).toHaveBeenCalledWith();
        });

        it('keeps the dialog open when cancelling the discard confirmation', async () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox', { name: 'Category name' }), 'test');
            await user.click(screen.getByRole('button', { name: 'Cancel' }));
            await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', { name: 'Category name' })).toHaveValue('test');
        });
    });

    describe('calls update group handler when adding a new entry', () => {
        const addGroup = vi.fn();

        it('closes dialog without error when successfully added', async () => {
            vi.mocked(useUpdateGroup).mockReturnValue(addGroup.mockResolvedValue(true));

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox'), 'Buitinė chemija');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).toHaveBeenCalledWith('Buitinė chemija', true, false, '');
            expect(onClose).toHaveBeenCalledWith('Buitinė chemija');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('renders with the review checkbox unchecked by default', async () => {
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            expect(screen.getByRole('checkbox', { name: /Review/ })).not.toBeChecked();
        });

        it('sends review = true when the checkbox is checked', async () => {
            vi.mocked(useUpdateGroup).mockReturnValue(addGroup.mockResolvedValue(true));

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox'), 'Buitinė chemija');
            await user.click(screen.getByRole('checkbox', { name: /Review/ }));
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).toHaveBeenCalledWith('Buitinė chemija', true, true, '');
            expect(onClose).toHaveBeenCalledWith('Buitinė chemija');
        });

        it('displays error without closing dialog when adding fails', async () => {
            vi.mocked(useUpdateGroup).mockReturnValue(addGroup.mockRejectedValueOnce('Failed to add'));
            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );
            await user.type(screen.getByRole('textbox', { name: 'Category name' }), 'Buitinė chemija');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).toHaveBeenCalledWith('Buitinė chemija', true, false, '');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to add');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            vi.mocked(useUpdateGroup).mockReturnValue(addGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            vi.mocked(useUpdateGroup).mockReturnValue(addGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox'), 'Uogienės');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Category already exists');
        });

        it('displays error without closing dialog when name contains colon', async () => {
            vi.mocked(useUpdateGroup).mockReturnValue(addGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            await user.type(screen.getByRole('textbox'), 'Group:Name');
            await user.click(screen.getByRole('button', { name: 'Add' }));

            expect(addGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Cannot contain ":" character');
        });
    });

    describe('calls rename group handler when updating an existing entry', () => {
        const renameGroup = vi.fn();

        it('closes dialog without error when successfully renamed', async () => {
            vi.mocked(useRenameGroup).mockReturnValue(renameGroup.mockResolvedValueOnce(true));

            render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'Konservai');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Konservai', true, false, '');
            expect(onClose).toHaveBeenCalledWith('Konservai');
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('displays error without closing dialog when rename fails', async () => {
            vi.mocked(useRenameGroup).mockReturnValue(renameGroup.mockRejectedValueOnce('Failed to rename'));

            render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'Konservai');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).toHaveBeenCalledWith('Daržovės', 'Konservai', true, false, '');
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to rename');
        });

        it('displays error without closing dialog when empty name field left', async () => {
            vi.mocked(useRenameGroup).mockReturnValue(renameGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox'));
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
        });

        it('displays error without closing dialog when name already exists', async () => {
            vi.mocked(useRenameGroup).mockReturnValue(renameGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'Uogienės');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Category already exists');
        });

        it('displays error without closing dialog when name contains colon', async () => {
            vi.mocked(useRenameGroup).mockReturnValue(renameGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'Group:Name');
            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox')).toHaveFocus();
            expect(screen.getByRole('alert')).toHaveTextContent('Cannot contain ":" character');
        });

        it('closes without updating when name was not changed', async () => {
            vi.mocked(useRenameGroup).mockReturnValue(renameGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened group="Daržovės" onClose={onClose} />
                </MockApp>
            );

            await user.click(screen.getByRole('button', { name: 'Update' }));

            expect(renameGroup).not.toHaveBeenCalled();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            expect(onClose).toHaveBeenCalledWith('Daržovės');
        });
    });

    describe('loading state with fake timers', () => {
        let resolveUpdate: () => void;

        beforeEach(() => vi.useFakeTimers());

        afterEach(() => vi.useRealTimers());

        it('shows loading state after 300ms delay when submitting form', async () => {
            const updateGroup = vi.fn().mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        resolveUpdate = resolve;
                    })
            );
            vi.mocked(useUpdateGroup).mockReturnValue(updateGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            act(() =>
                fireEvent.change(screen.getByRole('textbox', { name: 'Category name' }), {
                    target: { value: 'New Group' },
                })
            );

            const addButton = screen.getByRole('button', { name: 'Add' });
            act(() => fireEvent.click(addButton));

            expect(addButton).toBeDisabled();
            expect(within(addButton).queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();

            // Advance timers by 300ms to trigger loading state
            await act(() => vi.advanceTimersByTimeAsync(300));

            expect(within(addButton).getByRole('progressbar', { hidden: true })).toBeInTheDocument();

            // Complete the async operation and flush microtasks
            await act(async () => {
                resolveUpdate();
                await vi.runAllTimersAsync();
            });

            expect(addButton).not.toBeDisabled();
        });

        it('clears timeout when operation completes before 300ms', async () => {
            const updateGroup = vi.fn().mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        resolveUpdate = resolve;
                    })
            );
            vi.mocked(useUpdateGroup).mockReturnValue(updateGroup);

            render(
                <MockApp state={state}>
                    <GroupBox opened onClose={onClose} />
                </MockApp>
            );

            act(() =>
                fireEvent.change(screen.getByRole('textbox', { name: 'Category name' }), {
                    target: { value: 'Fast Group' },
                })
            );

            const addButton = screen.getByRole('button', { name: 'Add' });
            act(() => fireEvent.click(addButton));

            // Complete the async operation immediately (before 300ms)
            await act(() => {
                resolveUpdate();
            });

            // Advance timers by less than 300ms — timeout already cleared
            await act(() => vi.advanceTimersByTimeAsync(200));

            expect(addButton).not.toBeDisabled();
            expect(onClose).toHaveBeenCalledWith('Fast Group');
        });
    });
});
