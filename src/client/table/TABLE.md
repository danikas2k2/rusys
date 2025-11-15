# ✔️ Pagrindinė idėja

### 1. `touchstart` — tik pradedi rinkti duomenis

- išsisaugai pradžios koordinatę
- paleidi long-press timerį
- dar nieko nenusprendi

### 2. `touchmove` — sprendi gestą

- jei judama > X px horizontaliai → **swipe režimas**, atšauki long press
- jei judama > Y px vertikaliai → **scroll režimas**, atšauki long press
- scroll režime **neblokuoji** default scroll’o
- swipe režime **blokuoji** scroll’ą (`preventDefault()`)

### 3. `touchend` — išvedi galutinį veiksmą

- jei nebuvo swipe / scroll → click arba long press
- jei buvo swipe → pabaigi swipe animaciją
- jei buvo scroll → nieko nedarai (scroll finish)

---

# ✔️ Rekomenduojami parametrai

| Parametras               | Reikšmė    | Paaiškinimas                                |
| ------------------------ | ---------- | ------------------------------------------- |
| Horizontal threshold     | **12 px**  | nuo šios ribos gestas laikomas horizontaliu |
| Vertical threshold       | **12 px**  | analogiškai vertikaliam                     |
| Long press delay         | **450 ms** | Haptic touch jausmas                        |
| Cancel longPress on move | taip       | bet tik jei pasiektas threshold             |

---

# ✔️ Minimalus, aiškus kodas (galima tiesiai naudoti)

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

            // Jei jau scroll/swipe – tvarkome tik tą režimą
            if (gesture === 'swipe') {
                e.preventDefault(); // blokuojam scroll, nes jau swipe
                onSwipe?.(movedX, e);
                return;
            }
            if (gesture === 'scroll') {
                return; // leidžiam scrollinti
            }

            // Naujai nustatom režimą
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
    ); // būtina, kad veiktų preventDefault()

    el.addEventListener('touchend', (e) => {
        clearTimeout(longPressTimeout);

        if (gesture === 'press') {
            // nepajudėjo pakankamai -> click
            if (!longPressFired) {
                onClick?.(e);
            }
        }

        if (gesture === 'swipe') {
            // swipe pabaiga
            onSwipe?.('end', e);
        }
    });

    el.addEventListener('touchcancel', () => {
        clearTimeout(longPressTimeout);
    });
}
```

---

# ✔️ Kaip tai veikia tavo scenarijuje

### 🟦 Lentelė → scroll (vertikali kryptis)

Kai vartotojas tempia vertikaliai daugiau nei 12px, gestas tampa scroll’u, **long press atšaukiamas**, scroll leidžiamas.

### 🟥 Eilutės → swipe (horizontali kryptis)

Kai horizontalus poslinkis >12px ir didesnis nei vertikalus:

- pereinama į swipe režimą
- slinkimą blokuoji (`preventDefault`)
- gali rodyti „Delete / Edit“ veiksmus

### 🟧 Celė → click / long press

Kai judėjimo nėra:

- iki 450ms → click
- po 450ms → long press
