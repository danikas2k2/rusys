import AddCircleIcon from '@assets/add-circle.svg';
import MenuIcon from '@assets/menu.svg';
import RemoveIcon from '@assets/remove.svg';

import React, { type JSX } from 'react';
import { Prism } from 'react-syntax-highlighter';

import { Button, ButtonGroup } from '@ui/Button';

import { ordered, value, values } from '~/tutorial/articles/common';
import * as data from '~/tutorial/articles/element';

export default function ButtonArticle(): JSX.Element {
    const colors = ordered(data.colors, 'gray');
    const variants = ordered(data.variants, 'solid');
    const sizes = ordered(data.sizes, 'small');
    const spacing = ordered(data.spacing, 'small');
    const states = ordered(data.states, 'default');
    const aligns = ordered(data.buttonGroupAligns, 'full-width');

    // language=HTML
    // noinspection HtmlUnknownAttribute
    return (
        <article>
            <h1>Button</h1>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`import { Button } from '@ui/Button';\n
<Button
    variant="solid"
    color="neutral"
    size="small"
    spacing="small"
    disabled={false}
    // ...
    // any other valid html attributes, valid for HTMLButtonElement
>
    Content
</Button>`}
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

            <h2>Colors / Variants</h2>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<Button color="blue" variant="solid">\n\tContent\n</Button>`}
            </Prism>
            <section>
                <table>
                    <thead>
                        <tr>
                            <th align="right">Colors</th>
                            <th colSpan={variants.length}>Variants</th>
                        </tr>
                        <tr>
                            <th></th>
                            {variants.map((variant, v) => (
                                <th key={v}>
                                    <code data-default={!v}>{variant}</code>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {colors.map((color, c) => (
                            <tr key={color}>
                                <th>
                                    <code data-default={!c}>{color}</code>
                                </th>
                                {variants.map((variant) => (
                                    <td key={variant}>
                                        {states.map((state) => (
                                            <p key={state}>
                                                <Button variant={variant} color={color} state={state} fullWidth>
                                                    {state}
                                                </Button>
                                            </p>
                                        ))}
                                        <p key="disabled">
                                            <Button variant={variant} color={color} disabled fullWidth>
                                                disabled
                                            </Button>
                                        </p>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <h2>Sizes / Spacing</h2>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<Button size='medium' spacing='small'>\n\tContent\n</Button>`}
            </Prism>
            <section>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            {sizes.map((size, s) => (
                                <th key={s}>
                                    <code data-default={!s}>{size}</code>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {spacing.map((sp, x) => (
                            <tr key={x}>
                                <th>
                                    <code data-default={!x}>{sp}</code>
                                </th>
                                {sizes.map((size, s) => (
                                    <th key={s}>
                                        <Button size={size} spacing={sp}>
                                            Content
                                        </Button>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <h2>With icon</h2>
            <h3>Inline content</h3>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<Button>\n\t<MenuIcon />\n\tMenu\n</Button>`}
            </Prism>
            <section>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            {sizes.map((size, s) => (
                                <th key={s}>
                                    <code data-default={!s}>{size}</code>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {spacing.map((sp, x) => (
                            <tr key={x}>
                                <th>
                                    <code data-default={!x}>{sp}</code>
                                </th>
                                {sizes.map((size, s) => (
                                    <th key={s}>
                                        <Button size={size} spacing={sp}>
                                            <MenuIcon />
                                            <span>Menu</span>
                                        </Button>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <h3>Icon decorator</h3>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<Button startDecorator={<MenuIcon />}>\n\tMenu\n</Button>`}
            </Prism>
            <section>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            {sizes.map((size, s) => (
                                <th key={s}>
                                    <code data-default={!s}>{size}</code>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {spacing.map((sp, x) => (
                            <tr key={x}>
                                <th>
                                    <code data-default={!x}>{sp}</code>
                                </th>
                                {sizes.map((size, s) => (
                                    <th key={s}>
                                        <Button size={size} spacing={sp} startDecorator={<MenuIcon />}>
                                            <span>Menu</span>
                                        </Button>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <h2>Icon only</h2>
            <h3>Inline content</h3>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<Button>\n\t<MenuIcon />\n</Button>`}
            </Prism>
            <section>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            {sizes.map((size, s) => (
                                <th key={s}>
                                    <code data-default={!s}>{size}</code>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {spacing.map((sp, x) => (
                            <tr key={x}>
                                <th>
                                    <code data-default={!x}>{sp}</code>
                                </th>
                                {sizes.map((size, s) => (
                                    <th key={s}>
                                        <Button size={size} spacing={sp}>
                                            <MenuIcon />
                                        </Button>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <h3>Icon decorator</h3>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<Button startDecorator={<MenuIcon />} />\n\n<Button endDecorator={<MenuIcon />} />`}
            </Prism>
            <section>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            {sizes.map((size, s) => (
                                <th key={s}>
                                    <code data-default={!s}>{size}</code>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {spacing.map((sp, x) => (
                            <tr key={x}>
                                <th>
                                    <code data-default={!x}>{sp}</code>
                                </th>
                                {sizes.map((size, s) => (
                                    <th key={s}>
                                        <Button size={size} spacing={sp} startDecorator={<MenuIcon />} />
                                        <Button size={size} spacing={sp} endDecorator={<MenuIcon />} />
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <h2>Grouped Buttons</h2>
            <h3>Separate</h3>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<div>
    <Button>
        <RemoveIcon />
    </Button>
    <Button>
        <AddCircleIcon />
    </Button>
</div>`}
            </Prism>
            <h3>Grouped</h3>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<ButtonGroup>
    <Button>
        <RemoveIcon />
    </Button>
    <Button>
        <AddCircleIcon />
    </Button>
</ButtonGroup>`}
            </Prism>
            <section>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            {sizes.map((size, s) => (
                                <th key={s}>
                                    <code data-default={!s}>{size}</code>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>separate</th>
                            {sizes.map((size, s) => (
                                <th key={s}>
                                    <div>
                                        <Button size={size}>
                                            <RemoveIcon />
                                        </Button>
                                        <Button size={size}>
                                            <AddCircleIcon />
                                        </Button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                        <tr>
                            <th colSpan={4} align="center">
                                grouped
                            </th>
                        </tr>
                        {aligns.map((align) => (
                            <tr key={align}>
                                <th>{align}</th>
                                {sizes.map((size, s) => (
                                    <th key={s}>
                                        <ButtonGroup align={align}>
                                            <Button size={size}>
                                                <RemoveIcon />
                                            </Button>
                                            <Button size={size}>
                                                <AddCircleIcon />
                                            </Button>
                                        </ButtonGroup>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </article>
    );
}
