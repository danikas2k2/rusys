import type { ButtonAlign, ButtonGroupAlign } from '@ui/Button';
import type { ElementColor, ElementSize, ElementSpacing, ElementState, ElementVariant } from '@ui/Element';

export const colors: ElementColor[] = [
    'gray',
    'lavender',
    'blue',
    'sapphire',
    'sky',
    'teal',
    'green',
    'yellow',
    'peach',
    'maroon',
    'red',
    'mauve',
    'pink',
    'flamingo',
    'rosewater',
];
export const variants: ElementVariant[] = ['solid', 'soft', 'outlined', 'plain'];
export const sizes: ElementSize[] = ['small', 'medium', 'large'];
export const spacing: ElementSpacing[] = ['small', 'medium', 'large', 'half', 'none'];
export const states: ElementState[] = ['default', 'hover', 'focus', 'active'];
export const buttonAligns: ButtonAlign[] = ['single', 'start', 'center', 'end'];
export const buttonGroupAligns: ButtonGroupAlign[] = ['full-width', 'start', 'center', 'end'];
export const schemes = ['light', 'dark'];
export const modes = {
    text: 'Text',
    tel: '+37067812345',
    url: 'https://www.google.com',
    email: 'info@googe.com',
    numeric: 123.45,
    decimal: 123456789,
    search: 'Search',
};
