import { render, screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ConfirmableModal } from '~/components/common/ConfirmableModal';

vi.mock(import('~/components/common/Label'));

describe('<ConfirmableModal>', () => {
    const onClose = vi.fn();

    afterEach(() => vi.clearAllMocks());

    it('renders the modal content via the render prop', () => {
        render(
            <MockTheme>
                <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                    {() => <div>Modal content</div>}
                </ConfirmableModal>
            </MockTheme>
        );

        expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('closes without confirmation when not dirty', async () => {
        render(
            <MockTheme>
                <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                    {(handleClose) => (
                        <button type="button" onClick={handleClose}>
                            Cancel
                        </button>
                    )}
                </ConfirmableModal>
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onClose).toHaveBeenCalledWith();
        expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
    });

    it('asks for confirmation instead of closing when dirty', async () => {
        render(
            <MockTheme>
                <ConfirmableModal opened isDirty={() => true} onClose={onClose}>
                    {(handleClose) => (
                        <button type="button" onClick={handleClose}>
                            Cancel
                        </button>
                    )}
                </ConfirmableModal>
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
    });

    it('closes after confirming discard', async () => {
        render(
            <MockTheme>
                <ConfirmableModal opened isDirty={() => true} onClose={onClose}>
                    {(handleClose) => (
                        <button type="button" onClick={handleClose}>
                            Cancel
                        </button>
                    )}
                </ConfirmableModal>
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        await user.click(screen.getByRole('button', { name: 'Discard' }));

        expect(onClose).toHaveBeenCalledWith();
    });

    it('keeps the modal open when cancelling the discard confirmation', async () => {
        render(
            <MockTheme>
                <ConfirmableModal opened isDirty={() => true} onClose={onClose}>
                    {(handleClose) => (
                        <button type="button" onClick={handleClose}>
                            Cancel
                        </button>
                    )}
                </ConfirmableModal>
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('scrolls only the dialog after the keyboard has time to animate in', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });

        try {
            render(
                <MockTheme>
                    <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                        {() => <input aria-label="Name" />}
                    </ConfirmableModal>
                </MockTheme>
            );

            const input = screen.getByRole('textbox', { name: 'Name' });
            const content = screen.getByRole('dialog');
            content.style.overflowY = 'auto';
            Object.defineProperties(content, {
                clientHeight: { value: 200 },
                scrollHeight: { value: 400 },
            });
            vi.spyOn(content, 'getBoundingClientRect').mockReturnValue({
                top: 0,
                bottom: 200,
            } as DOMRect);
            vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
                top: 180,
                bottom: 220,
            } as DOMRect);
            await user.click(input);

            expect(content.scrollTop).toBe(0);

            vi.advanceTimersByTime(300);

            expect(content.scrollTop).toBe(20);
            expect(document.documentElement.scrollTop).toBe(0);
            expect(document.body.scrollTop).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    it('does not move a dialog when the focused input is already visible', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });

        try {
            render(
                <MockTheme>
                    <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                        {() => <input aria-label="Name" />}
                    </ConfirmableModal>
                </MockTheme>
            );

            const input = screen.getByRole('textbox', { name: 'Name' });
            const content = screen.getByRole('dialog');
            content.style.overflowY = 'auto';
            Object.defineProperties(content, {
                clientHeight: { value: 200 },
                scrollHeight: { value: 400 },
            });
            vi.spyOn(content, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 200 } as DOMRect);
            vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({ top: 100, bottom: 130 } as DOMRect);
            await user.click(input);
            vi.advanceTimersByTime(300);

            expect(content.scrollTop).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    it('keeps a focused input above the visual viewport without scrolling the page', async () => {
        const viewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
        Object.defineProperty(window, 'visualViewport', {
            configurable: true,
            value: Object.assign(new EventTarget(), { offsetTop: 0, height: 120 }),
        });
        vi.useFakeTimers({ shouldAdvanceTime: true });

        try {
            render(
                <MockTheme>
                    <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                        {() => (
                            <div data-testid="inner-scroll" style={{ overflowY: 'auto' }}>
                                <input aria-label="Name" />
                            </div>
                        )}
                    </ConfirmableModal>
                </MockTheme>
            );

            const input = screen.getByRole('textbox', { name: 'Name' });
            const scroller = screen.getByTestId('inner-scroll');
            Object.defineProperties(scroller, {
                clientHeight: { value: 300 },
                scrollHeight: { value: 600 },
            });
            vi.spyOn(scroller, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 300 } as DOMRect);
            vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({ top: 160, bottom: 190 } as DOMRect);
            await user.click(input);
            vi.advanceTimersByTime(300);

            expect(scroller.scrollTop).toBe(70);
            expect(document.documentElement.scrollTop).toBe(0);
            expect(document.body.scrollTop).toBe(0);
        } finally {
            if (viewport) {
                Object.defineProperty(window, 'visualViewport', viewport);
            } else {
                Reflect.deleteProperty(window, 'visualViewport');
            }
            vi.useRealTimers();
        }
    });

    it('shrinks a short standalone dialog when the keyboard covers the input', async () => {
        const originalMatchMedia = window.matchMedia.bind(window);
        const originalViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
        const viewport = Object.assign(new EventTarget(), { offsetTop: 0, height: 300 });
        window.matchMedia = (query) => ({
            ...originalMatchMedia(query),
            matches: query === '(display-mode: standalone)',
        });
        Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
        vi.useFakeTimers({ shouldAdvanceTime: true });

        try {
            const removeViewportListener = vi.spyOn(viewport, 'removeEventListener');
            const { unmount } = render(
                <MockTheme>
                    <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                        {() => <input aria-label="Name" />}
                    </ConfirmableModal>
                </MockTheme>
            );

            const input = screen.getByRole('textbox', { name: 'Name' });
            const content = screen.getByRole('dialog');
            content.style.overflowY = 'auto';
            Object.defineProperties(content, {
                clientHeight: { get: () => (content.hasAttribute('data-keyboard-viewport') ? 300 : 700) },
                scrollHeight: { value: 700 },
            });
            vi.spyOn(content, 'getBoundingClientRect').mockImplementation(
                () => ({ top: 0, bottom: content.clientHeight }) as DOMRect
            );
            vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({ top: 420, bottom: 450 } as DOMRect);

            await user.click(input);
            vi.advanceTimersByTime(300);

            expect(content).toHaveAttribute('data-keyboard-viewport');
            expect(content.style.getPropertyValue('--keyboard-viewport-height')).toBe('300px');
            expect(content.parentElement).toHaveAttribute('data-keyboard-viewport');
            expect(content.scrollTop).toBe(150);

            viewport.height = 700;
            viewport.dispatchEvent(new Event('resize'));
            vi.advanceTimersByTime(20);

            expect(content).not.toHaveAttribute('data-keyboard-viewport');
            expect(content.style.getPropertyValue('--keyboard-viewport-height')).toBe('');
            expect(content.parentElement).not.toHaveAttribute('data-keyboard-viewport');

            unmount();

            expect(removeViewportListener).toHaveBeenCalledWith('resize', expect.any(Function));
            expect(removeViewportListener).toHaveBeenCalledWith('scroll', expect.any(Function));
        } finally {
            window.matchMedia = originalMatchMedia;
            if (originalViewport) {
                Object.defineProperty(window, 'visualViewport', originalViewport);
            } else {
                Reflect.deleteProperty(window, 'visualViewport');
            }
            vi.useRealTimers();
        }
    });

    it('passes remaining scroll to the outer dialog when an inner panel reaches its limit', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });

        try {
            render(
                <MockTheme>
                    <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                        {() => (
                            <div data-testid="inner-scroll" style={{ overflowY: 'auto' }}>
                                <input aria-label="Name" />
                            </div>
                        )}
                    </ConfirmableModal>
                </MockTheme>
            );
            const input = screen.getByRole('textbox', { name: 'Name' });
            const inner = screen.getByTestId('inner-scroll');
            const outer = screen.getByRole('dialog');
            outer.style.overflowY = 'auto';
            Object.defineProperties(inner, {
                clientHeight: { value: 200 },
                scrollHeight: { value: 230 },
            });
            Object.defineProperties(outer, {
                clientHeight: { value: 300 },
                scrollHeight: { value: 500 },
            });
            vi.spyOn(inner, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 200 } as DOMRect);
            vi.spyOn(outer, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 300 } as DOMRect);
            vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({ top: 250, bottom: 280 } as DOMRect);

            await user.click(input);
            vi.advanceTimersByTime(300);

            expect(inner.scrollTop).toBe(30);
            expect(outer.scrollTop).toBe(50);
            expect(document.documentElement.scrollTop).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    it('uses the larger outer clipping distance after the inner panel reaches its limit', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });

        try {
            render(
                <MockTheme>
                    <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                        {() => (
                            <div data-testid="inner-scroll" style={{ overflowY: 'auto' }}>
                                <input aria-label="Name" />
                            </div>
                        )}
                    </ConfirmableModal>
                </MockTheme>
            );
            const input = screen.getByRole('textbox', { name: 'Name' });
            const inner = screen.getByTestId('inner-scroll');
            const outer = screen.getByRole('dialog');
            outer.style.overflowY = 'auto';
            Object.defineProperties(inner, { clientHeight: { value: 200 }, scrollHeight: { value: 230 } });
            Object.defineProperties(outer, { clientHeight: { value: 150 }, scrollHeight: { value: 400 } });
            vi.spyOn(inner, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 200 } as DOMRect);
            vi.spyOn(outer, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 150 } as DOMRect);
            vi.spyOn(input, 'getBoundingClientRect').mockImplementation(
                () => ({ top: 270 - inner.scrollTop, bottom: 300 - inner.scrollTop }) as DOMRect
            );

            await user.click(input);
            vi.advanceTimersByTime(300);

            expect(inner.scrollTop).toBe(30);
            expect(outer.scrollTop).toBe(120);
            expect(document.documentElement.scrollTop).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    it.each([
        {
            caseName: 'the input is visible inside a panel but clipped by the outer dialog',
            innerBounds: { top: 0, bottom: 200 },
            outerBounds: { top: 0, bottom: 100 },
            inputBounds: { top: 80, bottom: 130 },
            viewportHeight: 700,
            outerScroll: 30,
        },
        {
            caseName: 'the entire inner panel is outside the visual viewport',
            innerBounds: { top: 150, bottom: 300 },
            outerBounds: { top: 0, bottom: 300 },
            inputBounds: { top: 180, bottom: 210 },
            viewportHeight: 120,
            outerScroll: 90,
        },
    ])('scrolls the outer dialog when $caseName', async (scenario) => {
        const originalViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
        Object.defineProperty(window, 'visualViewport', {
            configurable: true,
            value: Object.assign(new EventTarget(), { offsetTop: 0, height: scenario.viewportHeight }),
        });
        vi.useFakeTimers({ shouldAdvanceTime: true });

        try {
            render(
                <MockTheme>
                    <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                        {() => (
                            <div data-testid="inner-scroll" style={{ overflowY: 'auto' }}>
                                <input aria-label="Name" />
                            </div>
                        )}
                    </ConfirmableModal>
                </MockTheme>
            );
            const input = screen.getByRole('textbox', { name: 'Name' });
            const inner = screen.getByTestId('inner-scroll');
            const outer = screen.getByRole('dialog');
            outer.style.overflowY = 'auto';
            Object.defineProperties(inner, { clientHeight: { value: 200 }, scrollHeight: { value: 400 } });
            Object.defineProperties(outer, { clientHeight: { value: 100 }, scrollHeight: { value: 500 } });
            vi.spyOn(inner, 'getBoundingClientRect').mockReturnValue(scenario.innerBounds as DOMRect);
            vi.spyOn(outer, 'getBoundingClientRect').mockReturnValue(scenario.outerBounds as DOMRect);
            vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(scenario.inputBounds as DOMRect);

            await user.click(input);
            vi.advanceTimersByTime(300);

            expect(inner.scrollTop).toBe(0);
            expect(outer.scrollTop).toBe(scenario.outerScroll);
            expect(document.documentElement.scrollTop).toBe(0);
        } finally {
            if (originalViewport) {
                Object.defineProperty(window, 'visualViewport', originalViewport);
            } else {
                Reflect.deleteProperty(window, 'visualViewport');
            }
            vi.useRealTimers();
        }
    });

    it('does not run delayed scrolling after the input is removed', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });

        try {
            const { unmount } = render(
                <MockTheme>
                    <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                        {() => <input aria-label="Name" />}
                    </ConfirmableModal>
                </MockTheme>
            );
            const input = screen.getByRole('textbox', { name: 'Name' });
            const geometry = vi.spyOn(input, 'getBoundingClientRect');

            await user.click(input);
            unmount();
            vi.advanceTimersByTime(300);

            expect(geometry).not.toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });

    it('does not scroll on focus for non-input elements', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const scrollIntoView = vi.fn();
        HTMLElement.prototype.scrollIntoView = scrollIntoView;

        try {
            render(
                <MockTheme>
                    <ConfirmableModal opened isDirty={() => false} onClose={onClose}>
                        {() => <button type="button">Focus me</button>}
                    </ConfirmableModal>
                </MockTheme>
            );

            await user.click(screen.getByRole('button', { name: 'Focus me' }));
            vi.advanceTimersByTime(300);

            expect(scrollIntoView).not.toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });

    it('guards escape/click-outside/header-close through the same handleClose', async () => {
        render(
            <MockTheme>
                <ConfirmableModal
                    opened
                    isDirty={() => true}
                    onClose={onClose}
                    withCloseButton
                    closeButtonProps={{ 'aria-label': 'Close' }}
                >
                    {() => <div>Modal content</div>}
                </ConfirmableModal>
            </MockTheme>
        );

        await user.click(screen.getByRole('button', { name: 'Close' }));

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
    });
});
