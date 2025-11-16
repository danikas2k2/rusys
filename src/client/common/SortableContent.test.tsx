import { render } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { SortableContent } from './SortableContent';

describe('<SortableContent>', () => {
    it('renders children', () => {
        const { container } = render(
            <MockTheme>
                <SortableContent items={['item-1', 'item-2']}>
                    <div>Child 1</div>
                    <div>Child 2</div>
                </SortableContent>
            </MockTheme>
        );

        expect(container.textContent).toContain('Child 1');
        expect(container.textContent).toContain('Child 2');
    });

    it('passes items to SortableContext', () => {
        const items = ['item-1', 'item-2', 'item-3'];

        const { container } = render(
            <MockTheme>
                <SortableContent items={items}>
                    <div>Content</div>
                </SortableContent>
            </MockTheme>
        );

        expect(container).toBeInTheDocument();
    });
});
