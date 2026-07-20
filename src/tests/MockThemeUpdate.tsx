import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { UpdateTypeContext, type UpdateTypes } from '~/client/common/UpdateTypeContext';

export function MockThemeUpdate({
    update = 'consumed',
    setUpdate = vi.fn(),
    children,
}: React.PropsWithChildren<{
    update?: UpdateTypes;
    setUpdate?: (updateType: UpdateTypes) => void;
}>): React.ReactElement {
    return (
        <MockTheme>
            <UpdateTypeContext value={[update, setUpdate]}>{children}</UpdateTypeContext>
        </MockTheme>
    );
}
