import AddIcon from '@assets/add.svg';
import RemoveIcon from '@assets/remove.svg';

import React, { type JSX } from 'react';
import { Prism } from 'react-syntax-highlighter';

import { Button, ButtonGroup } from '@ui/Button';
import { Option, Select } from '@ui/Select';

import { ordered, value, values } from '~/tutorial/articles/common';
import * as data from '~/tutorial/articles/element';

export default function SelectArticle(): JSX.Element {
    const colors = ordered(data.colors, 'gray');
    const variants = ordered(data.variants, 'outlined');
    const sizes = ordered(data.sizes, 'small');
    const spacing = ordered(data.spacing, 'small');
    const states = ordered(data.states, 'default');

    const options = [
        <Option key={10} value={10}>
            Ten
        </Option>,
        <Option key={20} value={20}>
            Twenty
        </Option>,
        <Option key={30} value={30}>
            Thirty
        </Option>,
    ];

    // eslint-disable-next-line no-console
    const onChange = console.info;

    // noinspection HtmlUnknownAttribute
    return (
        <article>
            <h1>Select</h1>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`import { Select } from '@ui/Select';\n
<Select
    variant="outlined"
    color="gray"
    size="small"
    spacing="small"
    multiple={false}
    value=""
    placeholder="Select something"
    disabled={false}
    fullWidth={false}
    // ...
    // any other valid html attributes, valid for the HTMLInputElement
/>`}
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
                        <td>The variant of the select.</td>
                    </tr>
                    <tr>
                        <td>color</td>
                        <td>{values(colors)}</td>
                        <td>{value(colors[0])}</td>
                        <td>The color of the select.</td>
                    </tr>
                    <tr>
                        <td>size</td>
                        <td>{values(sizes)}</td>
                        <td>{value(sizes[0])}</td>
                        <td>The size of the select.</td>
                    </tr>
                    <tr>
                        <td>spacing</td>
                        <td>{values(spacing)}</td>
                        <td>{value(spacing[0])}</td>
                        <td>The spacing of the select.</td>
                    </tr>
                    <tr>
                        <td>multiple</td>
                        <td>
                            <code>boolean</code>
                        </td>
                        <td>
                            <code>false</code>
                        </td>
                        <td>Whether the select is multiple.</td>
                    </tr>
                    <tr>
                        <td>value</td>
                        <td>
                            <code>string</code> | <code>number</code>
                        </td>
                        <td>—</td>
                        <td>The value of the select.</td>
                    </tr>
                    <tr>
                        <td>placeholder</td>
                        <td>
                            <code>string</code> | <code>number</code>
                        </td>
                        <td>—</td>
                        <td>The placeholder of the select, label is used if placeholder omitted.</td>
                    </tr>
                    <tr>
                        <td>label</td>
                        <td>
                            <code>string</code>
                        </td>
                        <td>—</td>
                        <td>The label of the select.</td>
                    </tr>
                    <tr>
                        <td>invalid</td>
                        <td>
                            <code>boolean</code>
                        </td>
                        <td>
                            <code>false</code>
                        </td>
                        <td>Whether the select is invalid.</td>
                    </tr>
                    <tr>
                        <td>error</td>
                        <td>
                            <code>string</code>
                        </td>
                        <td>—</td>
                        <td>The descriptive error label.</td>
                    </tr>
                    <tr>
                        <td>disabled</td>
                        <td>
                            <code>boolean</code>
                        </td>
                        <td>
                            <code>false</code>
                        </td>
                        <td>Whether the select is disabled.</td>
                    </tr>
                    <tr>
                        <td>fullWidth</td>
                        <td>
                            <code>boolean</code>
                        </td>
                        <td>
                            <code>false</code>
                        </td>
                        <td>Whether the select is full width.</td>
                    </tr>
                </tbody>
            </table>

            <h2>Single, no selected value</h2>
            <section>
                <Select label="Number" onChange={onChange}>
                    {options}
                </Select>
            </section>

            <h2>Single, no selected value, expanded</h2>
            <section>
                <Select label="Number" onChange={onChange} expanded>
                    {options}
                </Select>
            </section>

            <h2>Single, no options</h2>
            <section>
                <Select label="Number" onChange={onChange} />
            </section>

            <h2>Single, with selected value</h2>
            <section>
                <Select label="Number" value={20} onChange={onChange}>
                    {options}
                </Select>
            </section>

            <h2>Single, read-only</h2>
            <section>
                <Select label="Number" value={20} readOnly onChange={onChange}>
                    {options}
                </Select>
            </section>

            <h2>Colors / Variants / States</h2>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<Select color='blue' variant='outlined' />`}
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
                                            <>
                                                <p key={state}>
                                                    <Select
                                                        variant={variant}
                                                        color={color}
                                                        state={state}
                                                        label="Select"
                                                    >
                                                        {options}
                                                    </Select>
                                                </p>
                                                <p key={state}>
                                                    <Select
                                                        variant={variant}
                                                        color={color}
                                                        state={state}
                                                        label="Select"
                                                        value={20}
                                                    >
                                                        {options}
                                                    </Select>
                                                </p>
                                            </>
                                        ))}
                                        <p key="disabled">
                                            <Select variant={variant} color={color} disabled label="Select">
                                                {options}
                                            </Select>
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
                {`<LabeledInput size='medium' spacing='large' value='Value' />`}
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
                                    <td key={s}>
                                        <Select size={size} spacing={sp} label="Select">
                                            {options}
                                        </Select>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <h2>With decorators</h2>

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
                                    <td key={s}>
                                        <Select
                                            size={size}
                                            spacing={sp}
                                            label="Select"
                                            startDecorator="$"
                                            endDecorator={
                                                <ButtonGroup>
                                                    <Button size={size} spacing={sp}>
                                                        <AddIcon />
                                                    </Button>
                                                    <Button size={size} spacing={sp}>
                                                        <RemoveIcon />
                                                    </Button>
                                                </ButtonGroup>
                                            }
                                        >
                                            {options}
                                        </Select>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <h2>Full width</h2>

            <section>
                <table>
                    <tbody>
                        <tr>
                            <th></th>
                            <td>
                                <Select label="Select">{options}</Select>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <code>fullWidth</code>
                            </th>
                            <td>
                                <Select fullWidth label="Select">
                                    {options}
                                </Select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </article>
    );
}
