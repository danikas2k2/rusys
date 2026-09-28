import { Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import React, { useState } from 'react';

interface IconButtonTooltipProps {
    children: React.ReactElement;
    label?: string;
}

export function IconButtonTooltip({ children, label }: IconButtonTooltipProps): React.ReactElement {
    const canHover = useMediaQuery('(hover: hover)');
    const [below, setBelow] = useState(false);
    const tooltipLabel = label ?? (children.props as { 'aria-label'?: string })['aria-label'];

    return (
        <Tooltip
            label={tooltipLabel}
            disabled={!canHover || !tooltipLabel}
            openDelay={150}
            position="top"
            withArrow
            arrowSize={6}
            arrowRadius={2}
            offset={8}
            className="icon-button-tooltip"
            transitionProps={{ transition: below ? 'fade-down' : 'fade-up', duration: 150 }}
            onPositionChange={(position) => setBelow(position.startsWith('bottom'))}
        >
            {children}
        </Tooltip>
    );
}
