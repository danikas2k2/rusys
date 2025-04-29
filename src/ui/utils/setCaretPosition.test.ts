import { setCaretPosition } from './setCaretPosition';

describe('setCaretPosition', () => {
    let inputElement: HTMLInputElement;

    beforeEach(() => {
        inputElement = document.createElement('input');
        document.body.appendChild(inputElement);
    });

    afterEach(() => {
        document.body.removeChild(inputElement);
    });

    it('sets the caret position to the specified value', () => {
        inputElement.value = 'Hello, world!';
        setCaretPosition(inputElement, 5);

        expect(inputElement.selectionStart).toBe(5);
        expect(inputElement.selectionEnd).toBe(5);
    });

    it('focuses the input element', () => {
        jest.spyOn(inputElement, 'focus');
        setCaretPosition(inputElement, 0);

        expect(inputElement.focus).toHaveBeenCalledWith();
    });

    it('does not throw if setSelectionRange is not supported', () => {
        inputElement.setSelectionRange = undefined as any;

        expect(() => setCaretPosition(inputElement, 0)).not.toThrow();
    });
});
