declare module '*.svg' {
    import type { FunctionComponent, SVGProps } from 'react';

    const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
    export default ReactComponent;
}

declare module '*.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.css?module' {
    const classes: { readonly [key: string]: string };
    export default classes;
}
