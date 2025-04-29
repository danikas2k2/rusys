import { type ReactNode } from 'react';

export function getDecoratorType(decorator: ReactNode): 'text' | 'node' {
    const type = typeof decorator;
    if (type === 'string' || type === 'number' || type === 'boolean') {
        return 'text';
    }
    return 'node';
}
