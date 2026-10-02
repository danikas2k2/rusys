import { render, screen, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { useTransferAmounts } from '~/features/products/hooks/useTransferAmounts';
import { useGroups } from '~/store/groups';
import { useProducts } from '~/store/products';
import { useProfile } from '~/store/profile';
import { MoveVariantsBox } from './MoveVariantsBox';

vi.mock(import('~/store/groups/useGroups'));
vi.mock(import('~/store/products/useProducts'));
vi.mock(import('~/features/products/hooks/useTransferAmounts'));
vi.mock(import('~/store/profile/useProfile'));
vi.mock(import('~/features/products/ProductBox'), () => ({
    ProductBox: ({ opened, onClose }: { opened: boolean; onClose: (group?: string, name?: string) => void }) =>
        opened ? <button onClick={() => onClose('Kita', 'Naujas')}>Save new product</button> : null,
}));

describe('<MoveVariantsBox>', () => {
    const transfer = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();
    const onMoved = vi.fn();
    const amounts = [{ variant: 'stiklainis', amount: 2 }];

    beforeEach(() => {
        vi.mocked(useGroups).mockReturnValue([
            { group: 'Šaltinis', order: 0 },
            { group: 'Kita', order: 1 },
            { group: 'Tuščia', order: 2 },
        ]);
        vi.mocked(useProducts).mockReturnValue([
            { group: 'Šaltinis', name: 'Pradinis' },
            { group: 'Šaltinis', name: 'Tikslas' },
            { group: 'Šaltinis', name: 'Vaikas', parent: 'Tikslas' },
            { group: 'Kita', name: 'Naujas' },
        ]);
        vi.mocked(useProfile).mockReturnValue({ email: 'editor@example.com' });
        vi.mocked(useTransferAmounts).mockReturnValue(transfer);
    });

    afterEach(() => vi.clearAllMocks());

    const renderBox = () =>
        render(
            <MockTheme>
                <MoveVariantsBox
                    group="Šaltinis"
                    name="Pradinis"
                    year={24}
                    amounts={amounts}
                    onCancel={onCancel}
                    onMoved={onMoved}
                />
            </MockTheme>
        );

    it('offers other products in their hierarchy and excludes the source product', async () => {
        renderBox();
        await user.click(screen.getByRole('combobox', { name: 'Move to' }));

        expect(screen.queryByText('Pradinis')).not.toBeInTheDocument();
        expect(screen.getByText('Tikslas')).toBeInTheDocument();
        expect(screen.getByText('Vaikas')).toBeInTheDocument();
        expect(screen.queryByText('Tuščia')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Move' })).toBeDisabled();
    });

    it('transfers selected amounts to another product and reports completion', async () => {
        renderBox();
        await user.click(screen.getByRole('combobox', { name: 'Move to' }));
        await user.click(screen.getByText('Tikslas'));
        await user.click(screen.getByRole('button', { name: 'Move' }));

        await waitFor(() =>
            expect(transfer).toHaveBeenCalledWith(
                'Šaltinis',
                'Pradinis',
                24,
                'Šaltinis',
                'Tikslas',
                amounts,
                'editor@example.com'
            )
        );

        expect(onMoved).toHaveBeenCalledExactlyOnceWith();
    });

    it('warns when moving to another group and supports creating the destination', async () => {
        renderBox();
        await user.click(screen.getByRole('combobox', { name: 'Move to' }));
        await user.click(screen.getByText('New product'));
        await user.click(screen.getByRole('button', { name: 'Save new product' }));

        expect(screen.getByText(/Variants will be copied to/)).toHaveTextContent('Kita');

        await user.click(screen.getByRole('button', { name: 'Move' }));
        await waitFor(() =>
            expect(transfer).toHaveBeenCalledWith(
                'Šaltinis',
                'Pradinis',
                24,
                'Kita',
                'Naujas',
                amounts,
                'editor@example.com'
            )
        );
    });

    it('cancels without transferring', async () => {
        renderBox();
        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onCancel).toHaveBeenCalledExactlyOnceWith();
        expect(transfer).not.toHaveBeenCalled();
    });
});
