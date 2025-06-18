declare module '*.svg' {
    import { type FunctionComponent, type SVGProps } from 'react';

    const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
    export default ReactComponent;
}

declare module '*.css';

declare module '*.pcss';
