import { Modal } from '@mantine/core';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useLabel } from '~/lib/hooks/useLabel';
import { localImageLoader } from '~/lib/utils/localImageLoader';

import './ProductPhotoPreview.css';

interface Point {
    x: number;
    y: number;
}

interface DragState {
    pointerId: number;
    start: Point;
    offset: Point;
}

export interface ProductPhotoPreviewProps {
    photo: string;
    onError?: () => void;
    onOpenChange?: (opened: boolean) => void;
}

// The thumbnail is deliberately a normal, in-flow header item. The full image gets its own
// modal so it never competes with the product/history dialog's layout or close handling.
export function ProductPhotoPreview({ photo, onError, onOpenChange }: ProductPhotoPreviewProps): React.ReactElement {
    const closeLabel = useLabel('Close');
    const viewImageLabel = useLabel('View image');
    const zoomLabel = useLabel('Click to zoom');
    const panLabel = useLabel('Drag to pan');
    const [opened, setOpened] = useState(false);
    const [zoomed, setZoomed] = useState(false);
    const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
    const drag = useRef<DragState | undefined>(undefined);
    const hasDragged = useRef(false);

    const resetZoom = useCallback(() => {
        setZoomed(false);
        setOffset({ x: 0, y: 0 });
        drag.current = undefined;
        hasDragged.current = false;
    }, []);

    const handleOpen = useCallback(() => {
        resetZoom();
        onOpenChange?.(true);
        setOpened(true);
    }, [onOpenChange, resetZoom]);

    const handleClose = useCallback(() => {
        setOpened(false);
        onOpenChange?.(false);
        resetZoom();
    }, [onOpenChange, resetZoom]);

    // Mantine attaches Escape listeners per modal. Intercept it at the window capture phase while
    // this topmost viewer is open so a single Escape returns to the underlying product/history
    // dialog instead of closing both layers together.
    useEffect(() => {
        if (!opened) {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            handleClose();
        };
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [opened, handleClose]);

    const handleImageClick = useCallback(() => {
        if (hasDragged.current) {
            hasDragged.current = false;
            return;
        }
        setZoomed((current) => !current);
        setOffset({ x: 0, y: 0 });
    }, []);

    const handlePointerDown = useCallback<React.PointerEventHandler<HTMLButtonElement>>(
        (event) => {
            if (!zoomed) {
                return;
            }
            drag.current = {
                pointerId: event.pointerId,
                start: { x: event.clientX, y: event.clientY },
                offset,
            };
            event.currentTarget.setPointerCapture?.(event.pointerId);
        },
        [offset, zoomed]
    );

    const handlePointerMove = useCallback<React.PointerEventHandler<HTMLButtonElement>>((event) => {
        const currentDrag = drag.current;
        if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
            return;
        }
        const x = currentDrag.offset.x + event.clientX - currentDrag.start.x;
        const y = currentDrag.offset.y + event.clientY - currentDrag.start.y;
        hasDragged.current ||= Math.abs(x - currentDrag.offset.x) > 3 || Math.abs(y - currentDrag.offset.y) > 3;
        setOffset({ x, y });
    }, []);

    const handlePointerEnd = useCallback<React.PointerEventHandler<HTMLButtonElement>>((event) => {
        if (drag.current?.pointerId === event.pointerId) {
            drag.current = undefined;
            event.currentTarget.releasePointerCapture?.(event.pointerId);
        }
    }, []);

    return (
        <>
            <button className="product-photo-thumbnail" type="button" onClick={handleOpen} aria-label={viewImageLabel}>
                <Image
                    src={photo}
                    alt=""
                    width={48}
                    height={48}
                    loader={photo.startsWith('/images/') ? localImageLoader : undefined}
                    unoptimized={photo.includes('://') || photo.startsWith('data:')}
                    onError={onError}
                />
            </button>
            <Modal
                fullScreen
                opened={opened}
                withCloseButton
                title=""
                onClose={handleClose}
                closeButtonProps={{ 'aria-label': closeLabel }}
                data-photo-preview
            >
                <button
                    type="button"
                    aria-label={zoomed ? panLabel : zoomLabel}
                    data-photo-preview-viewport
                    data-zoomed={zoomed || undefined}
                    onClick={handleImageClick}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerEnd}
                    onPointerCancel={handlePointerEnd}
                >
                    <img
                        src={photo}
                        alt=""
                        draggable={false}
                        onError={onError}
                        style={zoomed ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined}
                    />
                </button>
            </Modal>
        </>
    );
}
