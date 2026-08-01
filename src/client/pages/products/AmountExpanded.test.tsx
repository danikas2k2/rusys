import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { AmountExpanded, type VariantDelta } from '~/client/pages/products/AmountExpanded';

vi.mock(import('@mantine/core'), async () => {
    const actual = await vi.importActual('@mantine/core');
    return {
        ...actual,
        // Mantine's autosize Textarea relies on document.fonts, which jsdom does not implement.
        Textarea: vi.fn(({ placeholder, value, onChange }: any) => (
            <textarea placeholder={placeholder} value={value} onChange={onChange} />
        )),
    };
});

describe('<AmountExpanded>', () => {
    const onChange = vi.fn();
    const onCommentChange = vi.fn();

    const zeroDelta: VariantDelta = { updated: 0, consumed: 0, recycled: 0 };

    afterEach(() => vi.clearAllMocks());

    it('renders the three amount rows', () => {
        render(
            <MockTheme>
                <AmountExpanded
                    delta={zeroDelta}
                    baseAmount={5}
                    comment=""
                    onChange={onChange}
                    onCommentChange={onCommentChange}
                />
            </MockTheme>
        );

        expect(screen.getByRole('textbox', { name: 'updated' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'consumed' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'recycled' })).toBeInTheDocument();
    });

    it('calls onCommentChange when the comment textarea changes', async () => {
        render(
            <MockTheme>
                <AmountExpanded
                    delta={zeroDelta}
                    baseAmount={5}
                    comment=""
                    onChange={onChange}
                    onCommentChange={onCommentChange}
                />
            </MockTheme>
        );

        await user.type(screen.getByPlaceholderText('Comment'), 'x');

        expect(onCommentChange).toHaveBeenCalledWith('x');
    });

    it('does not render suspicious/home buttons when the callbacks are not provided', () => {
        render(
            <MockTheme>
                <AmountExpanded
                    delta={zeroDelta}
                    baseAmount={5}
                    comment=""
                    onChange={onChange}
                    onCommentChange={onCommentChange}
                />
            </MockTheme>
        );

        expect(screen.queryByRole('button', { name: 'Suspicious' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Home' })).not.toBeInTheDocument();
    });
});
