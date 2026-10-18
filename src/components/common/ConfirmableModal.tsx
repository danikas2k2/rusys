import { Modal, type ModalProps } from '@mantine/core';
import React, { useEffect, useRef } from 'react';

import { DiscardChangesDialog } from '~/components/common/DiscardChangesDialog';
import { useConfirmClose } from '~/lib/hooks/useConfirmClose';

export interface ConfirmableModalProps extends Omit<ModalProps, 'children'> {
    isDirty: () => boolean;
    children: (handleClose: () => void) => React.ReactNode;
}

// Give the on-screen keyboard time to finish animating in before scrolling, so the target
// position is measured against the shrunk viewport rather than the pre-keyboard layout.
const FOCUS_SCROLL_DELAY = 300;
const SCROLLABLE_FOCUS_TAGS = new Set(['INPUT', 'TEXTAREA']);

function scrollFocusedInputWithinModal(target: HTMLElement): void {
    if (!target.isConnected || document.activeElement !== target) {
        return;
    }

    const modal = target.closest('[role="dialog"]');
    const viewportTop = window.visualViewport?.offsetTop ?? 0;
    const viewportBottom = viewportTop + (window.visualViewport?.height ?? window.innerHeight);

    let remaining = 0;
    for (
        let ancestor = target.parentElement;
        ancestor && modal?.contains(ancestor);
        ancestor = ancestor.parentElement
    ) {
        const overflow = window.getComputedStyle(ancestor).overflowY;
        if (!['auto', 'scroll'].includes(overflow) || ancestor.scrollHeight <= ancestor.clientHeight) {
            continue;
        }

        const input = target.getBoundingClientRect();
        const scrollport = ancestor.getBoundingClientRect();
        const top = Math.max(scrollport.top, viewportTop);
        const bottom = Math.min(scrollport.bottom, viewportBottom);
        if (bottom <= top) {
            continue;
        }

        const measured = input.top < top ? input.top - top : input.bottom > bottom ? input.bottom - bottom : 0;
        const distance =
            measured * remaining > 0
                ? Math.sign(measured) * Math.max(Math.abs(measured), Math.abs(remaining))
                : measured || remaining;
        if (distance === 0) {
            continue;
        }

        const before = ancestor.scrollTop;
        ancestor.scrollTop = Math.max(0, Math.min(before + distance, ancestor.scrollHeight - ancestor.clientHeight));
        remaining = distance - (ancestor.scrollTop - before);
        if (Math.abs(remaining) < 1) {
            remaining = 0;
        }
    }
}

function clearKeyboardViewport(modal: HTMLElement): void {
    modal.removeAttribute('data-keyboard-viewport');
    modal.style.removeProperty('--keyboard-viewport-height');
    modal.parentElement?.removeAttribute('data-keyboard-viewport');
    modal.parentElement?.style.removeProperty('--keyboard-viewport-top');
}

function syncKeyboardViewport(modal: HTMLElement, baselineHeight: number): void {
    const viewport = window.visualViewport;
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!standalone || !viewport || viewport.height <= 0 || baselineHeight - viewport.height < 80) {
        clearKeyboardViewport(modal);
        return;
    }

    modal.setAttribute('data-keyboard-viewport', '');
    modal.style.setProperty('--keyboard-viewport-height', `${viewport.height}px`);
    modal.parentElement?.setAttribute('data-keyboard-viewport', '');
    modal.parentElement?.style.setProperty('--keyboard-viewport-top', `${viewport.offsetTop}px`);
}

export function ConfirmableModal({ isDirty, onClose, children, ...props }: ConfirmableModalProps) {
    const { handleClose, confirming, handleConfirmDiscard, handleCancelDiscard } = useConfirmClose(isDirty, onClose);
    const focusCleanup = useRef<(() => void) | null>(null);

    useEffect(() => () => focusCleanup.current?.(), []);
    useEffect(() => {
        if (!props.opened) {
            focusCleanup.current?.();
        }
    }, [props.opened]);

    function handleFocusCapture(event: React.FocusEvent<HTMLDivElement>): void {
        const target = event.target;
        if (!(target instanceof HTMLElement) || !SCROLLABLE_FOCUS_TAGS.has(target.tagName)) {
            return;
        }

        focusCleanup.current?.();
        const modal = target.closest<HTMLElement>('[role="dialog"]');
        if (!modal) {
            return;
        }

        const viewport = window.visualViewport;
        const baselineHeight = Math.max(
            window.innerHeight,
            document.documentElement.clientHeight,
            viewport?.height ?? 0
        );
        let frame = 0;
        const update = () => {
            syncKeyboardViewport(modal, baselineHeight);
            scrollFocusedInputWithinModal(target);
        };
        const onViewportChange = () => {
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(update);
        };
        viewport?.addEventListener('resize', onViewportChange);
        viewport?.addEventListener('scroll', onViewportChange);
        const timeout = window.setTimeout(update, FOCUS_SCROLL_DELAY);
        focusCleanup.current = () => {
            window.clearTimeout(timeout);
            window.cancelAnimationFrame(frame);
            viewport?.removeEventListener('resize', onViewportChange);
            viewport?.removeEventListener('scroll', onViewportChange);
            clearKeyboardViewport(modal);
            focusCleanup.current = null;
        };
    }

    return (
        <>
            <Modal
                {...props}
                onClose={handleClose}
                onFocusCapture={handleFocusCapture}
                onBlurCapture={() => focusCleanup.current?.()}
            >
                {children(handleClose)}
            </Modal>
            <DiscardChangesDialog opened={confirming} onConfirm={handleConfirmDiscard} onClose={handleCancelDiscard} />
        </>
    );
}
