import {
    cloneElement,
    type FunctionComponent,
    type HTMLAttributes,
    isValidElement,
    type ReactNode,
    type RefAttributes,
} from 'react';

export type ReactNodeOrFunction<P extends HTMLAttributes<T> & RefAttributes<T>, T extends HTMLElement = HTMLElement> =
    | ReactNode
    | FunctionComponent<P>;

export function renderElement<P extends HTMLAttributes<T> & RefAttributes<T>, T extends HTMLElement = HTMLElement>(
    element: ReactNodeOrFunction<P, T>,
    props: P & RefAttributes<T> = {} as P,
    defaultProps: P & RefAttributes<T> = {} as P
): ReactNode | Promise<ReactNode> {
    if (typeof element === 'function') {
        return element({ ...defaultProps, ...props });
    }
    if (isValidElement(element)) {
        return cloneElement(element, { ...defaultProps, ...(element.props as HTMLAttributes<T>), ...props });
    }
    return element;
}
