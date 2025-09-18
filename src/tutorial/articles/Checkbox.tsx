import React, { type JSX } from 'react';
import { Prism } from 'react-syntax-highlighter';

import { Checkbox } from '@ui/Checkbox';

import { ordered, value, values } from '~/tutorial/articles/common';
import * as data from '~/tutorial/articles/element';

export default function CheckboxArticle(): JSX.Element {
    const colors = ordered(data.colors, 'gray');
    const variants = ordered(data.variants, 'outlined');
    const sizes = ordered(data.sizes, 'small');
    const spacing = ordered(data.spacing, 'small');
    const states = ordered(data.states, 'default');

    return (
        <article>
            <h1>Checkbox</h1>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`import { Checkbox } from '@ui/Checkbox';\n
<Checkbox
    variant="outlined"
    color="gray"
    size="small"
    spacing="small"
    checked={false}
    indeterminate={false}
    disabled={false}
    // ...
    // any other valid html attributes, valid for HTMLInputElement
>
    Label
</Checkbox>`}
            </Prism>
            <table>
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Type / Values</th>
                        <th>Default value</th>
                        <th>Description</th>
                        <th>Default Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>variant</td>
                        <td>{values(variants)}</td>
                        <td>{value(variants[0])}</td>
                        <td>The variant of the checkbox.</td>
                    </tr>
                    <tr>
                        <td>color</td>
                        <td>{values(colors)}</td>
                        <td>{value(colors[0])}</td>
                        <td>The color of the checkbox.</td>
                    </tr>
                    <tr>
                        <td>size</td>
                        <td>{values(sizes)}</td>
                        <td>{value(sizes[0])}</td>
                        <td>The size of the checkbox.</td>
                    </tr>
                    <tr>
                        <td>spacing</td>
                        <td>{values(spacing)}</td>
                        <td>{value(spacing[0])}</td>
                        <td>The spacing of the checkbox.</td>
                    </tr>
                    <tr>
                        <td>checked</td>
                        <td>
                            <code>boolean</code>
                        </td>
                        <td>
                            <code>false</code>
                        </td>
                        <td>Whether the checkbox is checked.</td>
                    </tr>
                    <tr>
                        <td>indeterminate</td>
                        <td>
                            <code>boolean</code>
                        </td>
                        <td>
                            <code>false</code>
                        </td>
                        <td>Whether the checkbox is indeterminate.</td>
                    </tr>
                    <tr>
                        <td>disabled</td>
                        <td>
                            <code>boolean</code>
                        </td>
                        <td>
                            <code>false</code>
                        </td>
                        <td>Whether the checkbox is disabled.</td>
                    </tr>
                </tbody>
            </table>

            <h2>Colors / Variants</h2>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<Checkbox color="blue" variant="solid">\n\tLabel\n</Checkbox>`}
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
                                <th key={variant}>
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
                                                <Checkbox variant={variant} color={color} state={state} checked>
                                                    {state}
                                                </Checkbox>
                                            </p>
                                        ))}
                                        <p key="disabled">
                                            <Checkbox variant={variant} color={color} disabled checked>
                                                disabled
                                            </Checkbox>
                                        </p>
                                        <p key="indeterminate">
                                            <Checkbox variant={variant} color={color} indeterminate>
                                                indeterminate
                                            </Checkbox>
                                        </p>
                                        <p key="unchecked">
                                            <Checkbox variant={variant} color={color}>
                                                unchecked
                                            </Checkbox>
                                        </p>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <h2>Sizes</h2>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<Checkbox size="medium">Label</Checkbox>`}
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
                            <th></th>
                            {sizes.map((size, s) => (
                                <td key={s}>
                                    <Checkbox size={size}>Label</Checkbox>
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <th>
                                <code>checked</code>
                            </th>
                            {sizes.map((size, s) => (
                                <td key={s}>
                                    <Checkbox size={size} checked>
                                        Label
                                    </Checkbox>
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <th>
                                <code>indeterminate</code>
                            </th>
                            {sizes.map((size, s) => (
                                <td key={s}>
                                    <Checkbox size={size} indeterminate>
                                        Indeterminate
                                    </Checkbox>
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <th>
                                <code>disabled</code>
                            </th>
                            {sizes.map((size, s) => (
                                <td key={s}>
                                    <Checkbox size={size} checked disabled>
                                        Disabled
                                    </Checkbox>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </section>
        </article>
    );
}
