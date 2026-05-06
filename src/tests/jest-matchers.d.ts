declare global {
    namespace jest {
        // noinspection JSUnusedGlobalSymbols
        interface Matchers<R> {
            toHaveListWithTextContent: (expected: string[]) => R;
            toBeExpanded: () => R;
            toBeCollapsed: () => R;
            toBeSelected: () => R;
        }

        interface Expect {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            event: (type: Event['type'], props?: object) => any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-function-type
            element: (<P = object>(type: Function, props?: Partial<P>) => any) &
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (<P = object>(type: string, props?: Partial<P>) => any) &
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (<P = object>(props: Partial<P>) => any) &
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (() => any);
        }
    }
}

export {};
