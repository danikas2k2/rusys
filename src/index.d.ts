declare module '*.svg' {
    import type { FunctionComponent, SVGProps } from 'react';

    const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
    export default ReactComponent;
}

declare module '*.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.pcss' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.pcss' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.pcss?module' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module 'virtual:css-fallback-client';
