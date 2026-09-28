import { Tooltip, type TooltipProps } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import React, { useState } from 'react';

interface IconButtonTooltipProps {
    children: React.ReactElement;
    label?: string;
    position?: TooltipProps['position'];
}

export function IconButtonTooltip({ children, label, position = 'top' }: IconButtonTooltipProps): React.ReactElement {
    const canHover = useMediaQuery('(hover: hover)');
    const [below, setBelow] = useState(false);
    const tooltipLabel = label ?? (children.props as { 'aria-label'?: string })['aria-label'];

    return (
        <Tooltip
            label={tooltipLabel}
            disabled={!canHover || !tooltipLabel}
            position={position}
            withArrow
            arrowSize={6}
            arrowRadius={2}
            offset={8}
            className="icon-button-tooltip"
            transitionProps={{
                transition: position === 'left' ? 'fade-left' : below ? 'fade-down' : 'fade-up',
                duration: 150,
            }}
            onPositionChange={(actualPosition) => setBelow(actualPosition.startsWith('bottom'))}
        >
            {children}
        </Tooltip>
    );
}
