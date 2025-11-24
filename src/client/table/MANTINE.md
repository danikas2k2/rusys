# ✅ **`usePointerGestures` hook (React) – rekomenduojama versija**

Šitas hook’as:

- atpažįsta horizontalų swipe, vertikalų scroll ir click/long-press
- veikia iPhone / iPad / Android / desktop
- naudojamas ant **eilutės** (`<tr>`) ar **celės** (`<td>`)
- neriboja Mantine scroll (scroll vyksta natūraliai)
- su pointer events, ne su touch events

---

## 🚀 Hook kodas (paruoštas naudoti)

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

            // jei jau swipe
            if (gesture.current === 'swipe') {
                e.preventDefault();
                onSwipeMove?.(movedX.current, e);
                return;
            }

            // jei jau scroll
            if (gesture.current === 'scroll') return;

            // nustatom kryptį
            if (Math.abs(movedX.current) > threshold && Math.abs(movedX.current) > Math.abs(movedY.current)) {
                // horizontalus swipe
                gesture.current = 'swipe';
                if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
                e.preventDefault();
                onSwipeMove?.(movedX.current, e);
            } else if (Math.abs(movedY.current) > threshold) {
                // vertikalus scroll
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

# 🔧 **Kaip naudoti su Mantine `<Table>`**

## ➤ **Swipe ant eilutės (`<tr>`)**

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

### Kodėl `touchAction: "pan-y"`?

- leidžia **scrollinti vertikaliai**
- bet neleidžia naršyklei „suvalgyti“ horizontalaus pointer move
- tai yra idealus nustatymas tavo scenarijui

---

## ➤ **Click + long-press ant celės (`<td>`)**

Jei nori, kad celė turėtų savo gestus:
_(bet dažniausiai užtenka ant `<tr>`)_

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

# 🧠 Praktiniai patarimai Mantine Table + iOS

Norint užtikrinti sklandų darbą:

### 1) ant visos lentelės arba wrapperio

```css
touch-action: pan-y;
-webkit-overflow-scrolling: touch;
```

### 2) nekabink pointer eventų ant `<Table.ScrollContainer>` vidinių struktūrų

Tik ant `<tr>` arba `<td>` — ten, kur reikia.

### 3) nepamiršk `passive: false` jei dirbtum su low-level listeneriais

Hook’e to nereikia – React tai jau apdoroja.
