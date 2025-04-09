export function setCaretPosition(element: HTMLInputElement, position: number): void {
    element.focus();
    element.setSelectionRange?.(position, position);
}
