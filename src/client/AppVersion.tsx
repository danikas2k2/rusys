import React from 'react';

import pkg from 'package.json';

export function AppVersion() {
    return <span>v{pkg.version}</span>;
}
