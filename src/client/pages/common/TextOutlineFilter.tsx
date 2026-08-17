import React from 'react';

import './TextOutlineFilter.pcss';

export function TextOutlineFilter() {
    return (
        <svg
            aria-hidden="true"
            width="0"
            height="0"
            style={{
                position: 'absolute',
                color: 'var(--mantine-color-body)',
                pointerEvents: 'none',
            }}
        >
            <defs>
                <filter
                    id="text-outline-filter"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                    colorInterpolationFilters="sRGB"
                >
                    <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="outline" />
                    <feFlood floodColor="currentColor" result="outline-color" />
                    <feComposite in="outline-color" in2="outline" operator="in" result="backdrop" />
                    <feMerge>
                        <feMergeNode in="backdrop" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
        </svg>
    );
}
