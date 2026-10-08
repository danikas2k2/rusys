# ✔️ Core idea

### 1. `touchstart` — start collecting data

- Save the starting coordinates.
- Start the long-press timer.
- Do not decide which gesture it is yet.

### 2. `touchmove` — identify the gesture

- If horizontal movement exceeds X px, enter **swipe mode** and cancel the long press.
- If vertical movement exceeds Y px, enter **scroll mode** and cancel the long press.
- In scroll mode, **allow** the default scrolling behavior.
- In swipe mode, **block** scrolling with `preventDefault()`.

### 3. `touchend` — finish the gesture

- If it was neither a swipe nor a scroll, handle a click or long press.
- If it was a swipe, finish the swipe animation.
- If it was a scroll, do nothing.

---

# ✔️ Recommended parameters

| Parameter                | Value      | Explanation                                   |
| ------------------------ | ---------- | --------------------------------------------- |
| Horizontal threshold     | **12 px**  | Movement beyond this is considered horizontal |
| Vertical threshold       | **12 px**  | The equivalent limit for vertical movement    |
| Long press delay         | **450 ms** | Provides a Haptic Touch feel                  |
| Cancel longPress on move | yes        | Only after the movement threshold is reached  |

---

# ✔️ Minimal example (ready to use)

```js
function attachGestureHandlers(el, { onClick, onLongPress, onSwipe }) {
    let startX = 0;
    let startY = 0;
    let movedX = 0;
    let movedY = 0;
    let gesture = null; // 'swipe' | 'scroll' | 'press'
    let longPressTimeout;
    let longPressFired = false;

    const LONG_PRESS_DELAY = 450;
    const THRESHOLD = 12;

    el.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        movedX = 0;
        movedY = 0;
        gesture = 'press';
        longPressFired = false;

        longPressTimeout = setTimeout(() => {
            if (gesture === 'press') {
                longPressFired = true;
                onLongPress?.(e);
            }
        }, LONG_PRESS_DELAY);
    });

    el.addEventListener(
        'touchmove',
        (e) => {
            const t = e.touches[0];
            movedX = t.clientX - startX;
            movedY = t.clientY - startY;

            // Continue handling the gesture already in progress
            if (gesture === 'swipe') {
                e.preventDefault(); // Block scrolling during a swipe
                onSwipe?.(movedX, e);
                return;
            }
            if (gesture === 'scroll') {
                return; // Allow scrolling
            }

            // Determine the gesture mode
            if (Math.abs(movedX) > THRESHOLD && Math.abs(movedX) > Math.abs(movedY)) {
                // Horizontal swipe
                gesture = 'swipe';
                clearTimeout(longPressTimeout);
                e.preventDefault();
                onSwipe?.(movedX, e);
            } else if (Math.abs(movedY) > THRESHOLD) {
                // Vertical scroll
                gesture = 'scroll';
                clearTimeout(longPressTimeout);
            }
        },
        { passive: false }
    ); // Required for preventDefault() to work

    el.addEventListener('touchend', (e) => {
        clearTimeout(longPressTimeout);

        if (gesture === 'press') {
            // Not enough movement: handle the click
            if (!longPressFired) {
                onClick?.(e);
            }
        }

        if (gesture === 'swipe') {
            // End of the swipe
            onSwipe?.('end', e);
        }
    });

    el.addEventListener('touchcancel', () => {
        clearTimeout(longPressTimeout);
    });
}
```

---

# ✔️ How this works in this case

### 🟦 Table → scroll (vertical movement)

When the user moves more than 12 px vertically, the gesture becomes a scroll. The **long press is canceled** and
scrolling is allowed.

### 🟥 Rows → swipe (horizontal movement)

When horizontal movement exceeds 12 px and is greater than vertical movement:

- Enter swipe mode.
- Block scrolling with `preventDefault`.
- Show actions such as “Delete” and “Edit”.

### 🟧 Cell → click or long press

When there is no movement:

- Before 450 ms → click.
- After 450 ms → long press.
