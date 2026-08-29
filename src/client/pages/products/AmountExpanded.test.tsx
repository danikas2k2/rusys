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

// Mantine's DatePicker labels each day button as e.g. "15 August 2026" (English, default locale
// in this test's MantineProvider-only tree) and reports the picked value as "2026-08-15".
function todayCalendarLabel(): string {
    const today = new Date();
    return `${today.getDate()} ${today.toLocaleDateString('en-US', { month: 'long' })} ${today.getFullYear()}`;
}

function todayIsoDate(): string {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

function yesterdayCalendarLabel(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getDate()} ${yesterday.toLocaleDateString('en-US', { month: 'long' })} ${yesterday.getFullYear()}`;
}

function yesterdayIsoDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;
}

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

    it('does not render suspicious/home/expiry buttons when the callbacks are not provided', () => {
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
        expect(screen.queryByRole('button', { name: 'Valid until' })).not.toBeInTheDocument();
    });

    it('renders the Suspicious button when onAddSuspicious is provided and calls it on click', async () => {
        const onAddSuspicious = vi.fn();
        render(
            <MockTheme>
                <AmountExpanded
                    delta={zeroDelta}
                    baseAmount={5}
                    comment=""
                    onChange={onChange}
                    onCommentChange={onCommentChange}
                    onAddSuspicious={onAddSuspicious}
                />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Suspicious' }));

        expect(onAddSuspicious).toHaveBeenCalledTimes(1);
    });

    it('renders the Home button when onAddHome is provided and calls it on click', async () => {
        const onAddHome = vi.fn();
        render(
            <MockTheme>
                <AmountExpanded
                    delta={zeroDelta}
                    baseAmount={5}
                    comment=""
                    onChange={onChange}
                    onCommentChange={onCommentChange}
                    onAddHome={onAddHome}
                />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Home' }));

        expect(onAddHome).toHaveBeenCalledTimes(1);
    });

    it('renders the add expiry icon button when onAddExpiry is provided', () => {
        render(
            <MockTheme>
                <AmountExpanded
                    delta={zeroDelta}
                    baseAmount={5}
                    comment=""
                    onChange={onChange}
                    onCommentChange={onCommentChange}
                    onAddExpiry={vi.fn()}
                />
            </MockTheme>
        );

        expect(screen.getByRole('button', { name: 'Valid until' })).toBeInTheDocument();
    });

    it('clicking the icon opens a calendar directly, with no confirm step', async () => {
        render(
            <MockTheme>
                <AmountExpanded
                    delta={zeroDelta}
                    baseAmount={5}
                    comment=""
                    onChange={onChange}
                    onCommentChange={onCommentChange}
                    onAddExpiry={vi.fn()}
                />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Valid until' }));

        expect(screen.getByRole('button', { name: todayCalendarLabel() })).toBeInTheDocument();
    });

    it('shows the decorative dialog icon in the calendar header, matching other dialogs', async () => {
        render(
            <MockTheme>
                <AmountExpanded
                    delta={zeroDelta}
                    baseAmount={5}
                    comment=""
                    onChange={onChange}
                    onCommentChange={onCommentChange}
                    onAddExpiry={vi.fn()}
                />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Valid until' }));

        expect(screen.getByRole('img', { name: 'Valid until' })).toBeInTheDocument();
    });

    it('picking a day calls onAddExpiry with that date and closes the calendar', async () => {
        const onAddExpiry = vi.fn();
        render(
            <MockTheme>
                <AmountExpanded
                    delta={zeroDelta}
                    baseAmount={5}
                    comment=""
                    onChange={onChange}
                    onCommentChange={onCommentChange}
                    onAddExpiry={onAddExpiry}
                />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Valid until' }));
        await user.click(screen.getByRole('button', { name: todayCalendarLabel() }));

        expect(onAddExpiry).toHaveBeenCalledWith(todayIsoDate());
        expect(screen.queryByRole('button', { name: todayCalendarLabel() })).not.toBeInTheDocument();
    });

    it('closes the calendar via the modal close button without calling onAddExpiry', async () => {
        const onAddExpiry = vi.fn();
        render(
            <MockTheme>
                <AmountExpanded
                    delta={zeroDelta}
                    baseAmount={5}
                    comment=""
                    onChange={onChange}
                    onCommentChange={onCommentChange}
                    onAddExpiry={onAddExpiry}
                />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Valid until' }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();

        await user.keyboard('{Escape}');

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(onAddExpiry).not.toHaveBeenCalled();
    });

    it('allows picking a past expiry date', async () => {
        const onAddExpiry = vi.fn();
        render(
            <MockTheme>
                <AmountExpanded
                    delta={zeroDelta}
                    baseAmount={5}
                    comment=""
                    onChange={onChange}
                    onCommentChange={onCommentChange}
                    onAddExpiry={onAddExpiry}
                />
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Valid until' }));

        await user.click(screen.getByRole('button', { name: yesterdayCalendarLabel() }));

        expect(onAddExpiry).toHaveBeenCalledWith(yesterdayIsoDate());
        expect(screen.queryByRole('button', { name: yesterdayCalendarLabel() })).not.toBeInTheDocument();
    });
});
