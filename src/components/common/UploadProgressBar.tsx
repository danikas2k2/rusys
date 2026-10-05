import { Progress } from '@mantine/core';
import React from 'react';

export function UploadProgressBar({ value }: { value?: number }) {
    if (value === undefined) {
        return null;
    }
    return <Progress value={value} color="positive" size="sm" aria-label="Upload progress" />;
}
