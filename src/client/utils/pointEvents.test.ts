import { fireEvent, render } from '@testing-library/react';

import React from 'react';

import { dispatchNativeCancelEvents, inBounds, type PointerEvents } from './pointEvents';

describe('pointEvents', () => {
    describe('dispatchNativeCancelEvents', () => {
        it('dispatches pointercancel and pointerout events', () => {
            const element = document.createElement('div');
            const pointerCancelSpy = jest.fn();
            const pointerOutSpy = jest.fn();

            element.addEventListener('pointercancel', pointerCancelSpy);
            element.addEventListener('pointerout', pointerOutSpy);

            dispatchNativeCancelEvents(element);

            expect(pointerCancelSpy).toHaveBeenCalledTimes(1);
            expect(pointerOutSpy).toHaveBeenCalledTimes(1);
        });

        it('handles null element gracefully', () => {
            expect(() => {
                dispatchNativeCancelEvents(null);
            }).not.toThrow();
        });

        it('dispatches events with bubbles: true', () => {
            const parent = document.createElement('div');
            const child = document.createElement('div');
            parent.appendChild(child);

            const parentSpy = jest.fn();
            parent.addEventListener('pointercancel', parentSpy);

            dispatchNativeCancelEvents(child);

            expect(parentSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('inBounds', () => {
        it('returns true when point is within bounds', () => {
            const TestComponent = () => {
                const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
                    expect(inBounds(e)).toBe(true);
                };

                return (
                    <div
                        style={{ width: '100px', height: '100px', position: 'absolute', left: 0, top: 0 }}
                        onPointerDown={handlePointerDown}
                    >
                        Test
                    </div>
                );
            };

            const { container } = render(<TestComponent />);
            const div = container.querySelector('div')!;

            fireEvent.pointerDown(div, { clientX: 50, clientY: 50 });
        });

        it('returns false when point is outside bounds', () => {
            const TestComponent = () => {
                const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
                    expect(inBounds(e)).toBe(false);
                };

                return (
                    <div
                        style={{ width: '100px', height: '100px', position: 'absolute', left: 0, top: 0 }}
                        onPointerDown={handlePointerDown}
                    >
                        Test
                    </div>
                );
            };

            const { container } = render(<TestComponent />);
            const div = container.querySelector('div')!;

            fireEvent.pointerDown(div, { clientX: 150, clientY: 150 });
        });

        it('returns true when point is on the left edge', () => {
            const TestComponent = () => {
                const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
                    expect(inBounds(e)).toBe(true);
                };

                return (
                    <div
                        style={{ width: '100px', height: '100px', position: 'absolute', left: 0, top: 0 }}
                        onPointerDown={handlePointerDown}
                    >
                        Test
                    </div>
                );
            };

            const { container } = render(<TestComponent />);
            const div = container.querySelector('div')!;
            const rect = div.getBoundingClientRect();

            fireEvent.pointerDown(div, { clientX: rect.left, clientY: rect.top });
        });

        it('returns true when point is on the right edge', () => {
            const TestComponent = () => {
                const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
                    expect(inBounds(e)).toBe(true);
                };

                return (
                    <div
                        style={{ width: '100px', height: '100px', position: 'absolute', left: 0, top: 0 }}
                        onPointerDown={handlePointerDown}
                    >
                        Test
                    </div>
                );
            };

            const { container } = render(<TestComponent />);
            const div = container.querySelector('div')!;
            const rect = div.getBoundingClientRect();

            fireEvent.pointerDown(div, { clientX: rect.right, clientY: rect.bottom });
        });

        it('returns false when point is to the left of bounds', () => {
            const TestComponent = () => {
                const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
                    expect(inBounds(e)).toBe(false);
                };

                return (
                    <div
                        style={{ width: '100px', height: '100px', position: 'absolute', left: 100, top: 0 }}
                        onPointerDown={handlePointerDown}
                    >
                        Test
                    </div>
                );
            };

            const { container } = render(<TestComponent />);
            const div = container.querySelector('div')!;

            fireEvent.pointerDown(div, { clientX: 50, clientY: 50 });
        });

        it('returns false when point is above bounds', () => {
            const TestComponent = () => {
                const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
                    expect(inBounds(e)).toBe(false);
                };

                return (
                    <div
                        style={{ width: '100px', height: '100px', position: 'absolute', left: 0, top: 100 }}
                        onPointerDown={handlePointerDown}
                    >
                        Test
                    </div>
                );
            };

            const { container } = render(<TestComponent />);
            const div = container.querySelector('div')!;

            fireEvent.pointerDown(div, { clientX: 50, clientY: 50 });
        });
    });
});

