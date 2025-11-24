import { dispatchNativeCancelEvents, inBounds } from './pointEvents';

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
            expect(() => dispatchNativeCancelEvents(null)).not.toThrow();
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
        const createEvent = (element: HTMLElement, clientX: number, clientY: number): PointerEvent => {
            const event = new PointerEvent('pointerdown', { clientX, clientY });
            Object.defineProperty(event, 'currentTarget', { value: element, writable: false });
            return event;
        };

        const div = document.createElement('div');
        div.style.width = '100px';
        div.style.height = '100px';
        div.style.position = 'absolute';

        beforeEach(() => {
            div.style.left = '0';
            div.style.top = '0';
            document.body.appendChild(div);
        });

        afterEach(() => document.body.removeChild(div));

        it('returns true when point is within bounds', () => {
            const rect = div.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const event = createEvent(div, centerX, centerY);

            expect(inBounds(event)).toBe(true);
        });

        it('returns false when point is outside bounds', () => {
            const rect = div.getBoundingClientRect();
            const event = createEvent(div, rect.right + 50, rect.bottom + 50);

            expect(inBounds(event)).toBe(false);
        });

        it('returns true when point is on the left edge', () => {
            const rect = div.getBoundingClientRect();
            const event = createEvent(div, rect.left, rect.top);

            expect(inBounds(event)).toBe(true);
        });

        it('returns true when point is on the right edge', () => {
            const rect = div.getBoundingClientRect();
            const event = createEvent(div, rect.right, rect.bottom);

            expect(inBounds(event)).toBe(true);
        });

        it('returns false when point is to the left of bounds', () => {
            div.style.left = '100px';

            const rect = div.getBoundingClientRect();
            const event = createEvent(div, rect.left - 50, rect.top + 50);

            expect(inBounds(event)).toBe(false);
        });

        it('returns false when point is above bounds', () => {
            div.style.top = '100px';

            const rect = div.getBoundingClientRect();
            const event = createEvent(div, rect.left + 50, rect.top - 50);

            expect(inBounds(event)).toBe(false);
        });
    });
});
