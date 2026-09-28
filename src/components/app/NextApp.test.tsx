import { render, screen } from '@testing-library/react';

import React from 'react';

import { NextApp } from './NextApp';

vi.mock(import('~/components/app/App'), () => ({ App: () => <main>Inventory app</main> }));

describe('<NextApp>', () => {
    it('mounts the application inside its providers', async () => {
        render(<NextApp />);

        await expect(screen.findByText('Inventory app')).resolves.toBeInTheDocument();
    });
});
