import { type WebpackExternalsMap } from './types';

export default function getExternals(isDevMode?: boolean): WebpackExternalsMap {
    return {
        // fs: 'fs',
        // moment: 'moment',
        // react: 'https://unpkg.com/react@18/cjs/react.production.min.js',
        // 'react-dom': 'ReactDOM',
        // 'react-dom/server': 'ReactDOMServer',
        // 'react-dom/client': 'https://unpkg.com/react-dom@18.2.0/cjs/react-dom.production.min.js',
        // 'react-router': 'ReactRouter',
        // 'react-router-dom': 'ReactRouterDOM',
        // 'video-react': 'https://unpkg.com/video-react/dist/video-react.full.min.js',
    };
}
