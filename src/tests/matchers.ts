export const expectElement = (type?: string | ((...args: never[]) => unknown) | object, props?: object) => {
    const element = { $$typeof: expect.any(Symbol) };

    switch (typeof type) {
        case 'undefined':
            return expect.objectContaining(element);

        case 'function':
        case 'string': {
            const typedElement = { ...element, type };
            return props
                ? expect.objectContaining({ ...typedElement, props: expect.objectContaining({ ...props }) })
                : expect.objectContaining(typedElement);
        }

        default:
            return expect.objectContaining({ ...element, props: expect.objectContaining({ ...type }) });
    }
};

export const expectEvent = (type: Event['type'], props?: object) => expect.objectContaining({ type, ...props });
