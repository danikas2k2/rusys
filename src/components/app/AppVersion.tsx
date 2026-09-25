import pkg from 'package.json';
import React from 'react';

export function AppVersion() {
    return <span>v{pkg.version}</span>;
}
