# Test File Specifications

This file defines the requirements for test files in the project.

## 1. Rendering and query methods

### 1.1. Synchronous vs. asynchronous queries

- **Use `screen.getBy*`** when an element renders immediately and no waiting is needed:

    ```tsx
    it('renders heading', () => {
        render(<Component />);

        expect(screen.getByRole('heading')).toBeInTheDocument();
    });
    ```

- **Use `await screen.findBy*`** only when you really need to wait for asynchronous rendering:

    ```tsx
    it('renders after loading', async () => {
        render(<Component />);

        await screen.findByRole('dialog');

        expect(ValueInput).toHaveBeenCalledTimes(3);
    });
    ```

### 1.2. Choosing query methods

- **ALWAYS use `screen.get*` / `screen.query*` / `screen.find*`** instead of `container.querySelector` /
  `document.querySelector`:

    ```tsx
    // ❌ BAD - uses querySelector
    const { container } = render(<Component />);
    expect(container.querySelectorAll('td')).toHaveLength(3);

    // ✅ GOOD - uses screen queries
    render(<Component />);
    expect(screen.getAllByRole('cell')).toHaveLength(3);
    ```

- **Why use `screen.*` instead of `querySelector`?**
    - `screen` queries are semantic and accessibility aware.
    - `screen` queries test the actual user experience.
    - `querySelector` is a low-level DOM API that does not reflect accessibility.
    - `screen` queries use the accessibility tree automatically.
    - Needing `querySelector` can indicate missing accessibility support or semantic HTML.

- **Examples:**

    ```tsx
    // ❌ BAD
    const { container } = render(
        <Table>
            <Table.Tbody>
                <Table.Tr>
                    <td>Cell</td>
                </Table.Tr>
            </Table.Tbody>
        </Table>
    );
    expect(container.querySelectorAll('td')).toHaveLength(1);

    // ✅ GOOD
    render(
        <Table>
            <Table.Tbody>
                <Table.Tr>
                    <td>Cell</td>
                </Table.Tr>
            </Table.Tbody>
        </Table>
    );
    expect(screen.getAllByRole('cell')).toHaveLength(1);

    // ❌ BAD
    const { container } = render(<Component />);
    const button = container.querySelector('button');

    // ✅ GOOD
    render(<Component />);
    const button = screen.getByRole('button');
    ```

### 1.3. NEVER use `data-testid`

- **STRICTLY FORBIDDEN:** using `data-testid` attributes in tests:

    ```tsx
    // ❌ BAD - do not use data-testid
    <div data-testid="user-name">John</div>;
    expect(screen.getByTestId('user-name')).toBeInTheDocument();

    // ✅ GOOD - use semantic queries
    <div role="heading">John</div>;
    expect(screen.getByRole('heading', { name: 'John' })).toBeInTheDocument();

    // ✅ GOOD - use text content
    <p>User: John</p>;
    expect(screen.getByText('User: John')).toBeInTheDocument();
    ```

- **Why avoid `data-testid`?**
    - Test IDs are not semantic and say nothing about an element's purpose.
    - Test IDs do not reflect the real user experience.
    - Test IDs create an indirect dependency between tests and implementation.
    - Semantic queries (role, label, text) test accessibility and UX.
    - Needing a test ID can indicate missing accessibility support.

- **Alternatives to test IDs:**
    - `getByRole()` — buttons, headings, links, textboxes, etc.
    - `getByLabelText()` — form inputs.
    - `getByText()` — visible text content.
    - `getByPlaceholderText()` — input placeholders.
    - `getByAltText()` — images.
    - `getByTitle()` — title attributes.

- **Examples:**

    ```tsx
    // ❌ BAD
    <button data-testid="submit-button">Submit</button>
    screen.getByTestId('submit-button')

    // ✅ GOOD
    <button type="submit">Submit</button>
    screen.getByRole('button', { name: 'Submit' })

    // ❌ BAD
    <div data-testid="error-message">Error occurred</div>
    screen.getByTestId('error-message')

    // ✅ GOOD
    <div role="alert">Error occurred</div>
    screen.getByRole('alert')

    // ❌ BAD
    <input data-testid="email-input" />
    screen.getByTestId('email-input')

    // ✅ GOOD
    <input aria-label="Email" />
    screen.getByRole('textbox', { name: 'Email' })
    ```

## 2. User interactions

### 2.1. `user-event` vs `fireEvent`

- **ALWAYS use `user-event`** instead of `fireEvent` when testing user interactions:

    ```tsx
    // ❌ BAD - uses fireEvent
    fireEvent.click(screen.getByRole('button'));

    // ✅ GOOD - uses user-event
    await user.click(screen.getByRole('button'));
    ```

- **Why use `user-event`?**
    - It simulates real user behavior (for example, a click triggers focus, hover, and other events).
    - It represents real user interactions more accurately.
    - It is asynchronous, so it better tests asynchronous behavior.

- **Pointer events and gestures**
    - **Use `user.pointer()`** to test mouse, touch, and pointer events:

        ```tsx
        // ✅ GOOD - mouse gesture with pointer API
        await user.pointer([
            { keys: '[MouseLeft>]', target: row, coords: { x: 100, y: 50 } }, // mouse down
            { coords: { x: 150, y: 50 } }, // mouse move
            { keys: '[/MouseLeft]' }, // mouse up
        ]);

        // ✅ GOOD - touch gesture
        await user.pointer([
            { keys: '[TouchA>]', target: row, coords: { x: 100, y: 50 } },
            { coords: { x: 50, y: 50 } },
            { keys: '[/TouchA]' },
        ]);
        ```

    - **Benefits of `user.pointer()`:**
        - It simulates real pointer behavior, including focus and hover.
        - It supports mouse, touch, and pen devices.
        - It triggers related events automatically in the correct order.
        - It better tests compatibility across devices.

    - **Pointer keys:**
        - `[MouseLeft>]` / `[/MouseLeft]` — left mouse button (down/up).
        - `[MouseRight>]` / `[/MouseRight]` — right mouse button.
        - `[MouseMiddle>]` / `[/MouseMiddle]` — middle mouse button.
        - `[TouchA>]` / `[/TouchA]` — touch point A (supports multitouch).
        - `[TouchB>]` / `[/TouchB]` — touch point B (supports multitouch gestures).

- **When should `fireEvent` be used?**
    - Only in **very rare cases** when `user-event` does not support the needed behavior:
        - Custom events (`fireEvent(element, new CustomEvent(...))`).
        - Specific low-level events that `user.pointer()` cannot simulate.

        ```tsx
        // ✅ GOOD - custom event unsupported by user-event
        fireEvent(element, new CustomEvent('customEvent', { detail: data }));
        ```

### 2.2. `user-event` setup

- **Set up user-event** in tests by importing it from `@testing-library/user-event`:

    ```tsx
    import user from '@testing-library/user-event';

    // Usage in tests
    it('handles click', async () => {
        render(<Component />);

        await user.click(screen.getByRole('button'));

        expect(onClick).toHaveBeenCalled();
    });
    ```

- **Main `user-event` functions:**
    - `user.click()` — click a button.
    - `user.dblClick()` — double-click.
    - `user.type()` — enter text in an input.
    - `user.clear()` — clear an input.
    - `user.selectOptions()` — select an option.
    - `user.hover()` — hover over an element.
    - `user.unhover()` — end a hover.
    - `user.tab()` — press Tab.
    - `user.keyboard()` — keyboard input.
    - `user.pointer()` — pointer, mouse, and touch gestures.

### 2.3. Examples

```tsx
// ✅ GOOD - click event
it('calls onClick when button is clicked', async () => {
    const onClick = jest.fn();
    render(<button onClick={onClick}>Click</button>);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
});

// ✅ GOOD - type event
it('updates input value', async () => {
    render(<input />);

    await user.type(screen.getByRole('textbox'), 'Hello');

    expect(screen.getByRole('textbox')).toHaveValue('Hello');
});

// ✅ GOOD - keyboard navigation
it('navigates with Tab', async () => {
    render(
        <form>
            <input />
            <input />
            <button />
        </form>
    );

    await user.tab();
    expect(screen.getAllByRole('textbox')[0]).toHaveFocus();

    await user.tab();
    expect(screen.getAllByRole('textbox')[1]).toHaveFocus();
});

// ✅ GOOD - swipe gesture with user.pointer()
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

// ✅ GOOD - mouse drag gesture
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

## 3. Formatting and spacing

### 3.1. Spacing around `render()`, `renderHook()`, and `rerender()`

- **ALWAYS leave a blank line after `render()` / `renderHook()` / `rerender()`:**

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

- **Leave a blank line before `render()` / `renderHook()` / `rerender()`** only if other code precedes it:

    ```tsx
    // ✅ GOOD - blank line because code precedes render
    it('test', async () => {
        const onClose = jest.fn();

        render(<Component onClose={onClose} />);

        await user.click(screen.getByRole('button'));
    });

    // ✅ GOOD - no blank line because render comes first
    it('test', () => {
        render(<Component />);

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    // ✅ GOOD - blank line before renderHook because code precedes it
    it('test', () => {
        const mockFn = jest.fn();

        const { result } = renderHook(() => useCustomHook(mockFn));

        expect(result.current).toBe(true);
    });

    // ✅ GOOD - no blank line because renderHook comes first
    it('test', () => {
        const { result } = renderHook(() => useCustomHook());

        expect(result.current).toBe(true);
    });
    ```

### 3.2. Spacing between logic blocks

- **Separate user actions** from `expect` with a blank line:

    ```tsx
    await user.type(screen.getByLabelText('name'), 'John');
    await user.click(screen.getByRole('button'));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
    ```

- **Keep related user actions together** without blank lines between them:

    ```tsx
    await user.type(screen.getByLabelText('p'), '2');
    await user.type(screen.getByLabelText('d'), '4');
    await user.type(screen.getByLabelText('m'), '6');

    await user.click(screen.getByText('Update'));
    ```

### 3.3. Variables in tests

- **Declare shared variables** before the `it()` blocks:

    ```tsx
    describe('<Component>', () => {
        const sharedValue = 'test';
        const onClose = jest.fn();

        it('test 1', () => {
            // uses sharedValue and onClose
        });

        it('test 2', () => {
            // uses sharedValue and onClose
        });
    });
    ```

- **Declare test-specific variables** separately inside each `it()` block:

    ```tsx
    it('test', async () => {
        const onClose = jest.fn();

        render(<Component onClose={onClose} />);
    });
    ```

## 4. Structure and organization

### 4.1. Grouping tests

- Use `describe()` blocks to group related tests:

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

### 4.2. `describe` titles for React components

- **When testing a React component, write its `describe` title as an element with `<>` brackets:**

    ```tsx
    // ✅ GOOD - React component
    describe('<ComponentName>', () => {
        it('renders correctly', () => {
            // ...
        });
    });

    // ✅ GOOD - hook or utility function
    describe('useCustomHook', () => {
        it('returns correct value', () => {
            // ...
        });
    });

    // ✅ GOOD - utility function
    describe('formatDate', () => {
        it('formats date correctly', () => {
            // ...
        });
    });
    ```

### 4.3. Test names

- Use clear, descriptive names.
- Start with an action or state.
- Examples:
    - ✅ `renders heading details`
    - ✅ `calls onClose when dialog is closed`
    - ✅ `does not accept any other symbols, but digits`

### 4.4. NEVER create extra render functions

- **STRICTLY FORBIDDEN:** helper functions that wrap `render()`:

    ```tsx
    // ❌ BAD - extra render function
    describe('<Component>', () => {
        const renderComponent = (props = {}) =>
            render(
                <MockApp>
                    <Component {...props} />
                </MockApp>
            );

        it('renders correctly', () => {
            renderComponent({ name: 'Test' });
            // ...
        });
    });

    // ✅ GOOD - call render() directly in every test
    describe('<Component>', () => {
        it('renders correctly', () => {
            render(
                <MockApp>
                    <Component name="Test" />
                </MockApp>
            );
            // ...
        });
    });
    ```

- **Why avoid render helpers?**
    - Helper functions hide the actual render process.
    - They make it hard to understand what happens in a test.
    - They can have unexpected side effects.
    - Each test should be clear and self-contained.
    - If a wrapper repeats, create a mock component instead (for example, `MockTableRow`).

- **When is an exception allowed?**
    - If a wrapper is very complex and repeats across many tests, create a separate mock component:

        ```tsx
        // ✅ GOOD - mock component for a complex, repeated wrapper
        // src/tests/MockTableRow.tsx
        export function MockTableRow({ children }: { children: React.ReactNode }) {
            return (
                <MockApp>
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>{children}</Table.Tr>
                        </Table.Tbody>
                    </Table>
                </MockApp>
            );
        }

        // In the test
        it('renders correctly', () => {
            render(
                <MockTableRow>
                    <Component />
                </MockTableRow>
            );
        });
        ```

## 5. Mocking and setup

### 5.1. Lifecycle hooks and cleanup

- **Use `afterEach()` for cleanup** after every test:

    ```tsx
    describe('<Component>', () => {
        const mockFunction = jest.fn();

        afterEach(() => jest.clearAllMocks());

        it('test', () => {
            // uses mockFunction
        });
    });
    ```

- **Use `afterAll()` instead of `afterEach()`** when cleanup is needed only once after all tests (for example,
  `jest.useRealTimers()`):

    ```tsx
    // ❌ BAD - useRealTimers is unnecessary after every test
    describe('with fake timers', () => {
        beforeEach(() => jest.useFakeTimers());

        afterEach(() => jest.useRealTimers());

        it('test 1', () => {
            /* ... */
        });
        it('test 2', () => {
            /* ... */
        });
    });

    // ✅ GOOD - useRealTimers once after all tests
    describe('with fake timers', () => {
        beforeEach(() => jest.useFakeTimers());

        afterAll(() => jest.useRealTimers());

        it('test 1', () => {
            /* ... */
        });
        it('test 2', () => {
            /* ... */
        });
    });
    ```

- **NEVER use `beforeEach()` for cleanup**; cleanup belongs in `afterEach()` or `afterAll()`:

    ```tsx
    // ❌ BAD - cleanup in beforeEach
    beforeEach(() => jest.clearAllMocks());

    // ✅ GOOD - cleanup in afterEach
    afterEach(() => jest.clearAllMocks());
    ```

### 5.2. Mock functions

- Declare them before tests if multiple tests use them.
- Use `jest.fn()` with descriptive names.
- Clear them after every test with `afterEach()`.

- **Use `jest.mocked()`** when working with mocked functions:

    ```tsx
    // ❌ BAD
    (useSetAmounts as jest.Mock).mockReturnValue(updateAmounts);

    // ✅ GOOD
    jest.mocked(useSetAmounts).mockReturnValue(updateAmounts);
    ```

    ```tsx
    // Complete example
    jest.mock('~/features/products/hooks/useSetAmounts');

    describe('<Component>', () => {
        const updateProduct = jest.fn();

        beforeAll(() => jest.mocked(useSetAmounts).mockReturnValue(updateProduct));

        it('calls update on submit', async () => {
            render(<Component />);

            await user.click(screen.getByRole('button'));

            expect(updateProduct).toHaveBeenCalledWith({ name: 'test' });
        });
    });
    ```

- **Use `beforeEach()` instead of `beforeAll()`** when tests change a mock's value:

    ```tsx
    // ❌ BAD - mock value is set in beforeAll but changed in tests
    describe('<Component>', () => {
        const setActive = jest.fn();

        beforeAll(() => {
            jest.mocked(useActiveContent).mockReturnValue([undefined, setActive]);
        });

        it('test 1', () => {
            jest.mocked(useActiveContent).mockReturnValue([{ data: {} }, setActive]);
            // test changes the mock value
        });

        it('test 2', () => {
            // test uses the wrong mock value from test 1
        });
    });

    // ✅ GOOD - mock value is reset in beforeEach between tests
    describe('<Component>', () => {
        const setActive = jest.fn();

        beforeEach(() => {
            jest.mocked(useActiveContent).mockReturnValue([undefined, setActive]);
        });

        it('test 1', () => {
            jest.mocked(useActiveContent).mockReturnValue([{ data: {} }, setActive]);
            // test changes the mock value
        });

        it('test 2', () => {
            // test uses the correct default mock value
        });
    });
    ```

- **NEVER test impossible scenarios or force types through casts:**

    ```tsx
    // ❌ BAD - forced cast when the type does not allow undefined
    jest.mocked(useQuickFilterContext).mockReturnValue([undefined as unknown as string, setFilter]);

    // ❌ BAD - scenario impossible under the types
    it('uses default empty string when filter is undefined', () => {
        jest.mocked(useQuickFilterContext).mockReturnValue([undefined as unknown as string, setFilter]);
        // ...
    });

    // ✅ GOOD - use an empty string to test the default value
    it('uses empty string when filter is empty', () => {
        jest.mocked(useQuickFilterContext).mockReturnValue(['', setFilter]);
        // ...
    });

    // ✅ GOOD - if the type allows undefined, test without casting
    it('handles undefined value', () => {
        jest.mocked(useGroups).mockReturnValue(undefined);
        // ...
    });
    ```

    - **Why avoid type casts?**
        - Casting hides the actual type structure.
        - Tests should reflect the real code and its types.
        - If a type does not permit `undefined`, that scenario is impossible.
        - Test only scenarios that are possible under the types.

### 5.3. Checking mock function calls

- **Use `toHaveBeenCalledWith()`** to check mock function calls:

    ```tsx
    // ✅ GOOD - assertion with toHaveBeenCalledWith
    expect(ImportBox).toHaveBeenCalledWith(
        expect.objectContaining({
            opened: true,
            onClose: expect.any(Function),
        }),
        undefined
    );
    ```

- **React components receive a second argument** (`undefined`), so include it in the assertion:

    ```tsx
    // ❌ BAD - checking only the first argument is insufficient
    expect(Component).toHaveBeenCalledWith(expect.objectContaining({ prop: 'value' }));

    // ✅ GOOD - include the second argument (React context)
    expect(Component).toHaveBeenCalledWith(expect.objectContaining({ prop: 'value' }), undefined);
    ```

- **Capture callback functions from mocked components** with `mockImplementation`:

    ```tsx
    // ✅ GOOD - capture the callback with mockImplementation
    it('calls callback when event occurs', () => {
        let mockCallback: (() => void) | null = null;
        jest.mocked(Component).mockImplementation(({ onClose }) => {
            mockCallback = onClose;
            return <div>Component</div>;
        });

        const onClose = jest.fn();

        render(<Wrapper onClose={onClose} />);

        mockCallback!();

        expect(onClose).toHaveBeenCalledWith();
    });
    ```

- **NEVER use `mock.calls` directly**; use Jest matchers:

    ```tsx
    // ❌ BAD - accesses mock.calls directly
    expect(jest.mocked(ProductCell).mock.calls.at(-1)?.[0]).toStrictEqual(
        expect.objectContaining({ last: true, year: years.at(-1) })
    );

    // ✅ GOOD - uses toHaveBeenLastCalledWith
    expect(ProductCell).toHaveBeenLastCalledWith(
        expect.objectContaining({ last: true, year: years.at(-1) }),
        undefined
    );
    ```

- **Use `toHaveBeenNthCalledWith()`** to check a call at a specific index:

    ```tsx
    // ✅ GOOD - check a specific call
    expect(Component).toHaveBeenNthCalledWith(1, expect.objectContaining({ prop: 'first' }), undefined);
    expect(Component).toHaveBeenNthCalledWith(2, expect.objectContaining({ prop: 'second' }), undefined);
    ```

- **Use `toHaveBeenLastCalledWith()`** to check the last call:

    ```tsx
    // ✅ GOOD - check the last call
    expect(Component).toHaveBeenLastCalledWith(expect.objectContaining({ last: true }), undefined);
    ```

- **Why avoid `mock.calls`?**
    - `mock.calls` is a low-level, nonsemantic API.
    - Jest matchers (`toHaveBeenNthCalledWith`, `toHaveBeenLastCalledWith`) are clearer and easier to read.
    - Jest matchers format error messages better automatically.
    - `mock.calls` requires manual type casts and null checks.

- **Alternative:** use `mock.calls` only in rare cases where `mockImplementation` and Jest matchers do not work:

    ```tsx
    // ⚠️ USE ONLY IF MOCKIMPLEMENTATION OR JEST MATCHERS DO NOT WORK
    const lastCall = jest.mocked(Component).mock.calls[jest.mocked(Component).mock.calls.length - 1]!;
    const onClose = lastCall[0].onClose;

    onClose();

    expect(onCloseHandler).toHaveBeenCalledWith();
    ```

- **Examples:**

    ```tsx
    // ✅ GOOD - assertion with toHaveBeenCalledWith
    jest.mock('~/features/dialogs/ImportBox', () => ({
        ImportBox: jest.fn(() => <div>ImportBox</div>),
    }));

    it('renders ImportBox with correct props', () => {
        render(
            <MockThemeActive active={{ action: 'import' }}>
                <ActiveImportBox />
            </MockThemeActive>
        );

        expect(ImportBox).toHaveBeenCalledWith(
            expect.objectContaining({
                opened: true,
                onClose: expect.any(Function),
            }),
            undefined
        );
    });

    // ✅ GOOD - capturing the callback
    it('calls setActive when onClose is called', () => {
        let mockClose: (() => void) | null = null;
        jest.mocked(ImportBox).mockImplementation(({ onClose }) => {
            mockClose = onClose;
            return <div>ImportBox</div>;
        });

        const mockSetActive = jest.fn();

        render(
            <MockThemeActive active={{ action: 'import' }} setActive={mockSetActive}>
                <ActiveImportBox />
            </MockThemeActive>
        );

        mockClose!();

        expect(mockSetActive).toHaveBeenCalledWith();
    });
    ```

### 5.4. State and fixtures

- Use fixture functions to prepare data.
- Declare shared state before the tests:

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

## 6. Arrow functions and syntax

### 6.1. One-line arrow functions

- **Avoid unnecessary braces** `{}` and `return` for one-line functions:

    ```tsx
    // ❌ BAD
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ✅ GOOD
    afterEach(() => jest.clearAllMocks());
    ```

    ```tsx
    // ❌ BAD
    const double = (x: number) => {
        return x * 2;
    };

    // ✅ GOOD
    const double = (x: number) => x * 2;
    ```

- **Use parentheses** when returning an object:

    ```tsx
    // ✅ GOOD - objects need parentheses
    const createUser = (name: string) => ({ name, active: true });

    // ✅ GOOD - multiple lines
    const processData = (data: Data) => {
        const result = transform(data);
        return validate(result);
    };
    ```

## 7. Comparing structures

### 7.1. Use `toStrictEqual` to compare structures

- **ALWAYS use `toStrictEqual`** when comparing objects, arrays, or other structures:

    ```tsx
    // ❌ BAD - many separate assertions
    expect(result.current).toHaveLength(1);
    expect(result.current[0].group).toBe('Group1');
    expect(result.current[0].years).toHaveLength(2);
    expect(result.current[0].years![0].amounts).toHaveLength(1);
    expect(result.current[0].years![0].amounts[0].recycled).toBe(true);
    expect(result.current[0].years![1].amounts).toHaveLength(1);
    expect(result.current[0].years![1].amounts[0].recycled).toBe(true);

    // ✅ GOOD - one toStrictEqual assertion
    expect(result.current).toStrictEqual([
        {
            group: 'Group1',
            name: 'Item1',
            years: [
                {
                    year: 2023,
                    amounts: [{ variant: 'v1', amount: 1, recycled: true }],
                },
                {
                    year: 2022,
                    amounts: [{ variant: 'v1', amount: 3, recycled: true }],
                },
            ],
        },
    ]);
    ```

- **Why use `toStrictEqual`?**
    - It compares structures more precisely (types, `undefined` versus missing properties).
    - It shows the whole structure clearly in one place.
    - It is easier to maintain: one assertion instead of many.
    - It better reflects the real data structure.

- **When should `expect.string*`, `expect.object*`, or `expect.array*` be used?**
    - When only part of a structure matters or its exact format is unimportant:

        ```tsx
        // ✅ GOOD - only part of the structure matters
        expect(result.current).toStrictEqual([
            {
                group: 'Group1',
                name: expect.stringContaining('Item'),
                years: expect.arrayContaining([
                    expect.objectContaining({
                        year: 2023,
                        amounts: expect.arrayContaining([expect.objectContaining({ recycled: true })]),
                    }),
                ]),
            },
        ]);

        // ✅ GOOD - only certain fields matter
        expect(result.current).toStrictEqual([
            expect.objectContaining({
                group: 'Group1',
                years: expect.any(Array),
            }),
        ]);
        ```

- **Examples:**

    ```tsx
    // ✅ GOOD - complete object
    expect(user).toStrictEqual({
        id: 1,
        name: 'John',
        email: 'john@example.com',
    });

    // ✅ GOOD - array of objects
    expect(items).toStrictEqual([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
    ]);

    // ✅ GOOD - empty array
    expect(result.current).toStrictEqual([]);

    // ✅ GOOD - partial match with expect.objectContaining
    expect(response).toStrictEqual(
        expect.objectContaining({
            status: 200,
            data: expect.arrayContaining([expect.objectContaining({ id: 1 })]),
        })
    );
    ```

## 8. Custom Jest matchers

The project defines additional custom Jest matchers in `jest/expect.ts`:

### 8.1. `toHaveListWithTextContent`

- Use it to check the text content of several elements at once:

    ```tsx
    // ❌ BAD - one at a time
    expect(cells[0]).toHaveTextContent('Name');
    expect(cells[1]).toHaveTextContent('.');
    expect(cells[2]).toHaveTextContent('.');
    expect(cells[3]).toHaveTextContent('2');

    // ✅ GOOD - all at once
    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveListWithTextContent(['Name', '.', '.', '2']);
    ```

### 8.2. Other custom matchers

- `toBeExpanded()` — checks `aria-expanded="true"`.
- `toBeCollapsed()` — checks that `aria-expanded` is not "true".
- `toBeSelected()` — checks `aria-selected="true"`.

## 9. Jest plugins

The project uses additional Jest plugins for more testing features.

### 9.1. jest-chain

Chain several matchers on one line:

```tsx
// ❌ BAD - variable and multiple lines
const badge = screen.getByRole('status');
expect(badge).toHaveTextContent('+1');
expect(badge).toHaveAttribute('data-state', 'positive');

// ✅ GOOD - chained assertion
expect(screen.getByRole('status')).toHaveTextContent('+1').toHaveAttribute('data-state', 'positive');
```

```tsx
// ✅ GOOD - compact one-liner
expect(screen.getByRole('status')).toHaveTextContent('+1').toHaveAttribute('data-state', 'positive');
```

### 9.2. jest-expect-message

Add custom error messages to assertions:

```tsx
// Usage with an additional message
expect(value, 'Value should be positive').toBeGreaterThan(0);

expect(cells, 'Year cells should have correct values').toHaveListWithTextContent(['', '.', '.', '2']);
```

### 9.3. jest-extended

Provides many additional matchers:

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
expect(arr).toSatisfyAll((x) => x > 0);
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

For the full list, see [jest-extended documentation](https://jest-extended.jestcommunity.dev/docs/matchers/).

## 10. Additional principles

- Testing library: `@testing-library/react`
- User interactions: `@testing-library/user-event`
- Prefer `getBy*` > `queryBy*` > `findBy*`.
- Always await completion of user events with `await`.
