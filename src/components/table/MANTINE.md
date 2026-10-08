# ✅ **`usePointerGestures` hook (React) — recommended version**

This hook:

- recognizes horizontal swipes, vertical scrolling, clicks, and long presses
- works on iPhone, iPad, Android, and desktop
- attaches to a **row** (`<tr>`) or **cell** (`<td>`)
- allows Mantine to scroll naturally
- uses pointer events rather than touch events

---

## 🚀 Hook code (ready to use)

```tsx
import { useRef, useCallback } from 'react';

export function usePointerGestures({
    onClick,
    onLongPress,
    onSwipeMove,
    onSwipeEnd,
    longPressDelay = 450,
    threshold = 12,
}) {
    const startX = useRef(0);
    const startY = useRef(0);
    const movedX = useRef(0);
    const movedY = useRef(0);
    const gesture = useRef<'press' | 'swipe' | 'scroll' | null>(null);
    const longPressTimeout = useRef<number | null>(null);
    const longPressFired = useRef(false);

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;

            gesture.current = 'press';
            longPressFired.current = false;

            startX.current = e.clientX;
            startY.current = e.clientY;
            movedX.current = 0;
            movedY.current = 0;

            longPressTimeout.current = window.setTimeout(() => {
                if (gesture.current === 'press') {
                    longPressFired.current = true;
                    onLongPress?.(e);
                }
            }, longPressDelay);
        },
        [onLongPress, longPressDelay]
    );

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (gesture.current == null) return;
            if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;

            movedX.current = e.clientX - startX.current;
            movedY.current = e.clientY - startY.current;

            // If already swiping
            if (gesture.current === 'swipe') {
                e.preventDefault();
                onSwipeMove?.(movedX.current, e);
                return;
            }

            // If already scrolling
            if (gesture.current === 'scroll') return;

            // Determine the direction
            if (Math.abs(movedX.current) > threshold && Math.abs(movedX.current) > Math.abs(movedY.current)) {
                // Horizontal swipe
                gesture.current = 'swipe';
                if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
                e.preventDefault();
                onSwipeMove?.(movedX.current, e);
            } else if (Math.abs(movedY.current) > threshold) {
                // Vertical scroll
                gesture.current = 'scroll';
                if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
            }
        },
        [onSwipeMove, threshold]
    );

    const onPointerUp = useCallback(
        (e: React.PointerEvent) => {
            if (gesture.current === 'press' && !longPressFired.current) {
                onClick?.(e);
            }
            if (gesture.current === 'swipe') {
                onSwipeEnd?.(movedX.current, e);
            }
            cleanup();
        },
        [onClick, onSwipeEnd]
    );

    const onPointerCancel = useCallback(() => cleanup(), []);

    // small internal cleaner
    function cleanup() {
        if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
        gesture.current = null;
    }

    return {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
    };
}
```

---

# 🔧 **Using it with Mantine `<Table>`**

## ➤ **Swipe on a row (`<tr>`)**

```tsx
function MyRow({ item }) {
    const gestures = usePointerGestures({
        onClick: () => console.log('click', item.id),
        onLongPress: () => console.log('long press', item.id),
        onSwipeMove: (dx) => console.log('swiping', dx),
        onSwipeEnd: (dx) => console.log('swipe end', dx),
    });

    return (
        <tr {...gestures} style={{ touchAction: 'pan-y' }}>
            <td>{item.name}</td>
            <td>{item.value}</td>
        </tr>
    );
}
```

### Why `touchAction: "pan-y"`?

- allows **vertical scrolling**
- prevents the browser from consuming horizontal pointer movement
- suits this interaction pattern

---

## ➤ **Click and long press on a cell (`<td>`)**

If a cell needs its own gestures: _(usually attaching the hook to `<tr>` is enough)_

```tsx
<td
    {...usePointerGestures({
        onClick: () => console.log('cell click'),
        onLongPress: () => console.log('cell long press'),
    })}
>
    {item.name}
</td>
```

---

# 🧠 Practical tips for Mantine Table and iOS

For smooth behavior:

### 1) On the whole table or its wrapper

```css
touch-action: pan-y;
-webkit-overflow-scrolling: touch;
```

### 2) Do not attach pointer events to the internals of `<Table.ScrollContainer>`

Attach them only to `<tr>` or `<td>`, where needed.

### 3) Use `passive: false` when working with low-level listeners

The hook does not need this; React already handles it.
