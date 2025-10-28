# Test File Specifications

Šiame faile aprašyti reikalavimai testų failams projekte.

## 1. Rendering ir Query metodai

### 1.1. Sinchroniniai vs Asinchroniniai Query

- **Naudoti `screen.getBy*`** kai elementas renderinasi iš karto ir nereikia laukti:

    ```tsx
    it('renders heading', () => {
        render(<Component />);

        expect(screen.getByRole('heading')).toBeInTheDocument();
    });
    ```

- **Naudoti `await screen.findBy*`** tik kai tikrai reikia laukti asinchroninio renderinimo:

    ```tsx
    it('renders after loading', async () => {
        render(<Component />);

        await screen.findByRole('dialog');

        expect(ValueInput).toHaveBeenCalledTimes(3);
    });
    ```

### 1.2. NIEKADA nenaudoti `data-testid`

- **GRIEŽTAI DRAUDŽIAMA** naudoti `data-testid` atributus testuose:

    ```tsx
    // ❌ BLOGAI - nenaudoti data-testid
    <div data-testid="user-name">John</div>
    expect(screen.getByTestId('user-name')).toBeInTheDocument();
    
    // ✅ GERAI - naudoti semantic queries
    <div role="heading">John</div>
    expect(screen.getByRole('heading', { name: 'John' })).toBeInTheDocument();
    
    // ✅ GERAI - naudoti text content
    <p>User: John</p>
    expect(screen.getByText('User: John')).toBeInTheDocument();
    ```

- **Kodėl ne `data-testid`?**
  - Test-id nėra semantiniai - nieko nesako apie elemento prasmę
  - Test-id neatspindi tikro user experience
  - Test-id sukuria tarpinę priklausomybę tarp testo ir implementacijos
  - Semantic queries (role, label, text) testuoja accessibility ir UX
  - Jei reikia test-id, tai reiškia, kad trūksta proper accessibility

- **Alternatyvos vietoj test-id:**
  - `getByRole()` - button, heading, link, textbox, etc.
  - `getByLabelText()` - form inputs
  - `getByText()` - visible text content
  - `getByPlaceholderText()` - input placeholder
  - `getByAltText()` - images
  - `getByTitle()` - title attribute

- **Pavyzdžiai:**

    ```tsx
    // ❌ BLOGAI
    <button data-testid="submit-button">Submit</button>
    screen.getByTestId('submit-button')
    
    // ✅ GERAI
    <button type="submit">Submit</button>
    screen.getByRole('button', { name: 'Submit' })
    
    // ❌ BLOGAI
    <div data-testid="error-message">Error occurred</div>
    screen.getByTestId('error-message')
    
    // ✅ GERAI
    <div role="alert">Error occurred</div>
    screen.getByRole('alert')
    
    // ❌ BLOGAI
    <input data-testid="email-input" />
    screen.getByTestId('email-input')
    
    // ✅ GERAI
    <input aria-label="Email" />
    screen.getByRole('textbox', { name: 'Email' })
    ```

## 2. User Interakcijos

### 2.1. `user-event` vs `fireEvent`

- **VISADA naudoti `user-event`** vietoj `fireEvent`, kai testuojamos user interakcijos:

    ```tsx
    // ❌ BLOGAI - naudoja fireEvent
    fireEvent.click(screen.getByRole('button'));
    
    // ✅ GERAI - naudoja user-event
    await user.click(screen.getByRole('button'));
    ```

- **Kodėl `user-event`?**
  - Simuliuoja tikrą user behavior (pvz., click triggerina focus, hover, ir kitus events)
  - Geriau atspindi realias user interakcijas
  - Asinchroninis - geriau testuoja async behavior

- **Pointer Events ir Gestures**
  - **Naudoti `user.pointer()`** mouse/touch/pointer events testuose:
    
    ```tsx
    // ✅ GERAI - pointer API mouse gesture
    await user.pointer([
        { keys: '[MouseLeft>]', target: row, coords: { x: 100, y: 50 } },  // mouse down
        { coords: { x: 150, y: 50 } },                                       // mouse move
        { keys: '[/MouseLeft]' },                                            // mouse up
    ]);
    
    // ✅ GERAI - touch gesture
    await user.pointer([
        { keys: '[TouchA>]', target: row, coords: { x: 100, y: 50 } },
        { coords: { x: 50, y: 50 } },
        { keys: '[/TouchA]' },
    ]);
    ```

  - **`user.pointer()` privalumai:**
    - Simuliuoja tikrą pointer behavior (focus, hover, ir t.t.)
    - Palaiko mouse, touch, pen įrenginius
    - Automatiškai triggerina susijusius events tinkama tvarka
    - Geriau testuoja cross-device compatibility

  - **Pointer keys:**
    - `[MouseLeft>]` / `[/MouseLeft]` - kairysis pelės mygtukas (down/up)
    - `[MouseRight>]` / `[/MouseRight]` - dešinysis pelės mygtukas
    - `[MouseMiddle>]` / `[/MouseMiddle]` - vidurinis pelės mygtukas
    - `[TouchA>]` / `[/TouchA]` - touch taškas A (multi-touch support)
    - `[TouchB>]` / `[/TouchB]` - touch taškas B (multi-touch gestures)

- **Kada naudoti `fireEvent`?**
  - Tik **labai retais atvejais**, kai `user-event` nepalaiko reikalingo funkcionalumo:
    - Custom events (`fireEvent(element, new CustomEvent(...))`)
    - Specifiniai low-level events, kurių `user.pointer()` negali simuliuoti

    ```tsx
    // ✅ GERAI - custom event (user-event nepalaiko)
    fireEvent(element, new CustomEvent('customEvent', { detail: data }));
    ```

### 5.2. `user-event` setup

- **Setup user-event** testuose naudojant import iš `@testing-library/user-event`:

    ```tsx
    import user from '@testing-library/user-event';
    
    // Naudojimas testuose
    it('handles click', async () => {
        render(<Component />);
        
        await user.click(screen.getByRole('button'));
        
        expect(onClick).toHaveBeenCalled();
    });
    ```

- **Pagrindinės `user-event` funkcijos:**
  - `user.click()` - mygtuko paspaudimas
  - `user.dblClick()` - dvigubas paspaudimas
  - `user.type()` - tekstas input laukelyje
  - `user.clear()` - input lauko išvalymas
  - `user.selectOptions()` - select elemento pasirinkimas
  - `user.hover()` - hover over element
  - `user.unhover()` - hover išėjimas
  - `user.tab()` - Tab klavišo paspaudimas
  - `user.keyboard()` - klaviatūros įvestis
  - `user.pointer()` - pointer/mouse/touch gestures

### 3.3. Pavyzdžiai

```tsx
// ✅ GERAI - click event
it('calls onClick when button is clicked', async () => {
    const onClick = jest.fn();
    render(<button onClick={onClick}>Click</button>);
    
    await user.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalledTimes(1);
});

// ✅ GERAI - type event
it('updates input value', async () => {
    render(<input />);
    
    await user.type(screen.getByRole('textbox'), 'Hello');
    
    expect(screen.getByRole('textbox')).toHaveValue('Hello');
});

// ✅ GERAI - keyboard navigation
it('navigates with Tab', async () => {
    render(<form><input /><input /><button /></form>);
    
    await user.tab();
    expect(screen.getAllByRole('textbox')[0]).toHaveFocus();
    
    await user.tab();
    expect(screen.getAllByRole('textbox')[1]).toHaveFocus();
});

// ✅ GERAI - swipe gesture su user.pointer()
it('handles swipe gesture', async () => {
    const { container } = render(<SwipeableRow />);
    const row = container.querySelector('tr')!;
    
    await user.pointer([
        { keys: '[TouchA>]', target: row, coords: { x: 100, y: 50 } },
        { coords: { x: 50, y: 50 } },
        { keys: '[/TouchA]' },
    ]);
    
    expect(onSwipe).toHaveBeenCalled();
});

// ✅ GERAI - mouse drag gesture
it('handles drag gesture', async () => {
    const onDrag = jest.fn();
    const { container } = render(<DraggableItem onDrag={onDrag} />);
    const item = container.querySelector('.draggable')!;
    
    await user.pointer([
        { keys: '[MouseLeft>]', target: item, coords: { x: 0, y: 0 } },
        { coords: { x: 100, y: 0 } },
        { coords: { x: 200, y: 0 } },
        { keys: '[/MouseLeft]' },
    ]);
    
    expect(onDrag).toHaveBeenCalled();
});
```

## 3. Formatavimas ir Tarpai

### 8.1. Tarpai aplink `render()`, `renderHook()` ir `rerender()`

- **Po `render()` / `renderHook()` / `rerender()` VISADA** tuščia eilutė:

    ```tsx
    render(<Component />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    ```

    ```tsx
    const { result } = renderHook(() => useCustomHook());

    expect(result.current).toBe(true);
    ```

    ```tsx
    const { result, rerender } = renderHook(() => useCustomHook());
    const firstValue = result.current;

    rerender();

    const secondValue = result.current;
    expect(firstValue).toBe(secondValue);
    ```

- **Prieš `render()` / `renderHook()` / `rerender()` tuščia eilutė** tik jei prieš ją yra kitas kodas:

    ```tsx
    // ✅ GERAI - tuščia eilutė, nes yra kodas prieš render
    it('test', async () => {
        const onClose = jest.fn();

        render(<Component onClose={onClose} />);

        await user.click(screen.getByRole('button'));
    });

    // ✅ GERAI - be tuščios eilutės, nes render pirmas
    it('test', () => {
        render(<Component />);

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    // ✅ GERAI - tuščia eilutė prieš renderHook, nes yra kodas prieš
    it('test', () => {
        const mockFn = jest.fn();

        const { result } = renderHook(() => useCustomHook(mockFn));

        expect(result.current).toBe(true);
    });

    // ✅ GERAI - be tuščios eilutės, nes renderHook pirmas
    it('test', () => {
        const { result } = renderHook(() => useCustomHook());

        expect(result.current).toBe(true);
    });
    ```

### 5.2. Tarpai tarp logikos blokų

- **User veiksmai** atskirti tuščia eilute nuo `expect`:

    ```tsx
    await user.type(screen.getByLabelText('name'), 'John');
    await user.click(screen.getByRole('button'));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
    ```

- **Keli susiję user veiksmai** be tarpų tarp jų:

    ```tsx
    await user.type(screen.getByLabelText('p'), '2');
    await user.type(screen.getByLabelText('d'), '4');
    await user.type(screen.getByLabelText('m'), '6');

    await user.click(screen.getByText('Update'));
    ```

### 3.3. Kintamieji testuose

- **Bendri kintamieji** deklaruoti prieš `it()` blokus:

    ```tsx
    describe('<Component>', () => {
        const sharedValue = 'test';
        const onClose = jest.fn();

        it('test 1', () => {
            // naudoja sharedValue ir onClose
        });

        it('test 2', () => {
            // naudoja sharedValue ir onClose
        });
    });
    ```

- **Specifiniai kintamieji** deklaruoti kiekviename `it()` bloke atskirai:

    ```tsx
    it('test', async () => {
        const onClose = jest.fn();

        render(<Component onClose={onClose} />);
    });
    ```

## 4. Struktūra ir Organizavimas

### 8.1. Test grupavimas

- Naudoti `describe()` blokus susijusiems testams grupuoti:

    ```tsx
    describe('ensure to have no negative amounts', () => {
        it('does not accept any other symbols', async () => {
            // ...
        });

        it('does not decrease value below zero', async () => {
            // ...
        });
    });
    ```

### 5.2. Test pavadinimai

- Naudoti aiškius, aprašomuosius pavadinimus
- Pradėti veiksmu arba būsena
- Pavyzdžiai:
    - ✅ `renders heading details`
    - ✅ `calls onClose when dialog is closed`
    - ✅ `does not accept any other symbols, but digits`

## 5. Mocking ir Setup

### 5.1. Lifecycle Hooks ir Cleanup

- **Naudoti `afterEach()` cleanup'ui** po kiekvieno testo:

    ```tsx
    describe('<Component>', () => {
        const mockFunction = jest.fn();

        afterEach(() => jest.clearAllMocks());

        it('test', () => {
            // naudoja mockFunction
        });
    });
    ```

- **Naudoti `afterAll()` vietoj `afterEach()`** kai cleanup'as reikalingas tik vieną kartą po visų testų (pvz., `jest.useRealTimers()`):

    ```tsx
    // ❌ BLOGAI - useRealTimers kiekvieno testo gale nereikalingas
    describe('with fake timers', () => {
        beforeEach(() => jest.useFakeTimers());
        
        afterEach(() => jest.useRealTimers());

        it('test 1', () => { /* ... */ });
        it('test 2', () => { /* ... */ });
    });

    // ✅ GERAI - useRealTimers tik vieną kartą po visų testų
    describe('with fake timers', () => {
        beforeEach(() => jest.useFakeTimers());
        
        afterAll(() => jest.useRealTimers());

        it('test 1', () => { /* ... */ });
        it('test 2', () => { /* ... */ });
    });
    ```

- **NIEKADA nenaudoti `beforeEach()` cleanup'ui** - cleanup'as turi būti `afterEach()` arba `afterAll()`:

    ```tsx
    // ❌ BLOGAI - cleanup beforeEach
    beforeEach(() => jest.clearAllMocks());

    // ✅ GERAI - cleanup afterEach
    afterEach(() => jest.clearAllMocks());
    ```

### 5.2. Mock funkcijos

- Deklaruoti prieš testus, jei naudojamos keliuose testuose
- Naudoti `jest.fn()` su aprašomais pavadinimais
- Išvalyti po kiekvieno testo su `afterEach()`

- **Naudoti `jest.mocked()`** dirbant su mock'intomis funkcijomis:

    ```tsx
    // ❌ BLOGAI
    (useUpdateDetails as jest.Mock).mockReturnValue(updateAmounts);

    // ✅ GERAI
    jest.mocked(useUpdateDetails).mockReturnValue(updateAmounts);
    ```

    ```tsx
    // Pilnas pavyzdys
    jest.mock('~/client/state/details/useUpdateDetails');

    describe('<Component>', () => {
        const updateDetails = jest.fn();

        beforeAll(() => jest.mocked(useUpdateDetails).mockReturnValue(updateDetails));

        it('calls update on submit', async () => {
            render(<Component />);

            await user.click(screen.getByRole('button'));

            expect(updateDetails).toHaveBeenCalledWith({ name: 'test' });
        });
    });
    ```

### 5.2. State ir Fixtures

- Naudoti fixture funkcijas duomenims paruošti
- Deklaruoti prieš testus, jei state bendras:

    ```tsx
    describe('<Component>', () => {
        const variants = getVariantsFixture();
        const state: WithVariantsState = { variants };

        it('test', () => {
            render(
                <MockApp state={state}>
                    <Component />
                </MockApp>
            );
        });
    });
    ```

## 6. Arrow Funkcijos ir Sintaksė

### 8.1. Vienos eilutės arrow funkcijos

- **Nenaudoti nereikalingų skliaustų** `{}` ir `return`, jei funkcija vienos eilutės:

    ```tsx
    // ❌ BLOGAI
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ✅ GERAI
    afterEach(() => jest.clearAllMocks());
    ```

    ```tsx
    // ❌ BLOGAI
    const double = (x: number) => {
        return x * 2;
    };

    // ✅ GERAI
    const double = (x: number) => x * 2;
    ```

- **Naudoti skliaustu** kai reikia grąžinti objektą:

    ```tsx
    // ✅ GERAI - objektui reikia skliaustų
    const createUser = (name: string) => ({ name, active: true });

    // ✅ GERAI - kelios eilutės
    const processData = (data: Data) => {
        const result = transform(data);
        return validate(result);
    };
    ```

## 7. Custom Jest Matchers

Projektas turi papildomus custom Jest matchers (`jest/expect.ts`):

### 8.1. `toHaveListWithTextContent`

- Naudoti tikrinti kelių elementų text content vienu metu:

    ```tsx
    // ❌ BLOGAI - po vieną
    expect(cells[0]).toHaveTextContent('Name');
    expect(cells[1]).toHaveTextContent('.');
    expect(cells[2]).toHaveTextContent('.');
    expect(cells[3]).toHaveTextContent('2');

    // ✅ GERAI - vienu metu
    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveListWithTextContent(['Name', '.', '.', '2']);
    ```

### 8.2. Kiti custom matchers

- `toBeExpanded()` - tikrina `aria-expanded="true"`
- `toBeCollapsed()` - tikrina `aria-expanded` nėra "true"
- `toBeSelected()` - tikrina `aria-selected="true"`

## 8. Jest Pluginai

Projektas naudoja papildomus Jest pluginus, kurie suteikia daugiau galimybių testavimui.

### 8.1. jest-chain

Leidžia grandinėti (`chain`) kelis matchers į vieną eilutę:

```tsx
// ❌ BLOGAI - kintamasis ir kelios eilutės
const badge = screen.getByRole('status');
expect(badge).toHaveTextContent('+1');
expect(badge).toHaveAttribute('data-state', 'positive');

// ✅ GERAI - grandininis patikrinimas
expect(screen.getByRole('status'))
    .toHaveTextContent('+1')
    .toHaveAttribute('data-state', 'positive');
```

```tsx
// ✅ GERAI - kompaktiška viena eilutė
expect(screen.getByRole('status')).toHaveTextContent('+1').toHaveAttribute('data-state', 'positive');
```

### 8.2. jest-expect-message

Leidžia pridėti custom error pranešimus prie assertions:

```tsx
// Naudojimas su papildomu pranešimu
expect(value, 'Value should be positive').toBeGreaterThan(0);

expect(cells, 'Year cells should have correct values')
    .toHaveListWithTextContent(['', '.', '.', '2']);
```

### 8.3. jest-extended

Suteikia daug papildomų matchers:

#### String matchers

```tsx
expect(str).toBeString();
expect(str).toBeEmpty();
expect(str).toStartWith('prefix');
expect(str).toEndWith('suffix');
expect(str).toInclude('substring');
```

#### Number matchers

```tsx
expect(num).toBeNumber();
expect(num).toBePositive();
expect(num).toBeNegative();
expect(num).toBeWithin(1, 10);
```

#### Array matchers

```tsx
expect(arr).toBeArray();
expect(arr).toBeArrayOfSize(5);
expect(arr).toIncludeAllMembers([1, 2, 3]);
expect(arr).toIncludeAnyMembers([1, 5]);
expect(arr).toSatisfyAll(x => x > 0);
```

#### Object matchers

```tsx
expect(obj).toBeObject();
expect(obj).toContainKeys(['name', 'age']);
expect(obj).toContainValues(['John', 25]);
```

#### Boolean matchers

```tsx
expect(value).toBeBoolean();
expect(value).toBeTrue();
expect(value).toBeFalse();
```

#### Date matchers

```tsx
expect(date).toBeDate();
expect(date).toBeBefore(otherDate);
expect(date).toBeAfter(otherDate);
```

Pilną sąrašą rasite: [jest-extended documentation](https://jest-extended.jestcommunity.dev/docs/matchers/)

## 9. Papildomi Principai

- Testavimo biblioteka: `@testing-library/react`
- User interakcijos: `@testing-library/user-event`
- Pageidautina `getBy*` > `queryBy*` > `findBy*` eiliškumas
- Visuomet laukti user event completion su `await`
