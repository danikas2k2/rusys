import React, { type JSX } from 'react';
import { Prism } from 'react-syntax-highlighter';

import { Button } from '@ui/Button';
import { Dropdown } from '@ui/Dropdown';

import { ordered, value, values } from '~/tutorial/articles/common';
import * as data from '~/tutorial/articles/element';

function Demo() {
    return (
        <Dropdown trigger={<Button>click to open</Button>}>
            <div
                style={{
                    width: 200,
                    height: 200,
                    color: 'var(--color-text)',
                    backgroundColor: 'var(--color-body)',
                }}
            >
                content
            </div>
        </Dropdown>
    );
}

export default function MenuArticle(): JSX.Element {
    const colors = ordered(data.colors, 'gray');
    const variants = ordered(data.variants, 'solid');
    const sizes = ordered(data.sizes, 'small');
    const spacing = ordered(data.spacing, 'small');

    return (
        <article>
            <h1>Menu</h1>
            <Demo />
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`import { Menu } from '@ui/Menu';\n
<Menu
    variant="solid"
    color="gray"
    size="small"
    spacing="small"
    disabled={false}
    // ...
    // any other valid html attributes, valid for the HTMLButtonElement
>
    Content
</Menu>`}
            </Prism>
            <table>
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Type / Values</th>
                        <th>Default value</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>variant</td>
                        <td>{values(variants)}</td>
                        <td>{value(variants[0])}</td>
                        <td>The variant of the button.</td>
                    </tr>
                    <tr>
                        <td>color</td>
                        <td>{values(colors)}</td>
                        <td>{value(colors[0])}</td>
                        <td>The color of the button.</td>
                    </tr>
                    <tr>
                        <td>size</td>
                        <td>{values(sizes)}</td>
                        <td>{value(sizes[0])}</td>
                        <td>The size of the button.</td>
                    </tr>
                    <tr>
                        <td>spacing</td>
                        <td>{values(spacing)}</td>
                        <td>{value(spacing[0])}</td>
                        <td>The spacing of the button.</td>
                    </tr>
                    <tr>
                        <td>disabled</td>
                        <td>
                            <code>boolean</code>
                        </td>
                        <td>
                            <code>false</code>
                        </td>
                        <td>Whether the button is disabled.</td>
                    </tr>
                </tbody>
            </table>

            <h2>Two Buttons</h2>

            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<Menu>
    <MenuButton>
        <MenuIcon />
        Menu
    </MenuButton>
</Menu>`}
            </Prism>
        </article>
    );
}
