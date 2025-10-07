import AddIcon from '@assets/add.svg';
import RemoveIcon from '@assets/remove.svg';

import React, { type JSX } from 'react';
import { Prism } from 'react-syntax-highlighter';

import { Button, ButtonGroup } from '@ui/Button';
import { Input, type InputMode } from '@ui/Input';
import { ordered, value, values } from '@ui/tutorial/articles/common';
import * as data from '@ui/tutorial/articles/element';

export default function InputArticle(): JSX.Element {
    const colors = ordered(data.colors, 'gray');
    const variants = ordered(data.variants, 'outlined');
    const sizes = ordered(data.sizes, 'small');
    const spacing = ordered(data.spacing, 'small');
    const states = ordered(data.states, 'default');
    const modes = ordered(Object.keys(data.modes) as InputMode[], 'text');

    // noinspection HtmlUnknownAttribute
    return (
        <article>
            <h1>Input</h1>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`import { Input } from '@ui/Input';\n
<Input
    variant="outlined"
    color="gray"
    size="small"
    spacing="small"
    mode="text"
    value=""
    placeholder="Enter something"
    label="Input label"
    invalid={false}
    error="Error label"
    disabled={false}
    fullWidth={false}
    // ...
    // any other valid html attributes, valid for HTMLInputElement
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
                        <td>The variant of the input.</td>
                    </tr>
                    <tr>
                        <td>color</td>
                        <td>{values(colors)}</td>
                        <td>{value(colors[0])}</td>
                        <td>The color of the input.</td>
                    </tr>
                    <tr>
                        <td>size</td>
                        <td>{values(sizes)}</td>
                        <td>{value(sizes[0])}</td>
                        <td>The size of the input.</td>
                    </tr>
                    <tr>
                        <td>spacing</td>
                        <td>{values(spacing)}</td>
                        <td>{value(spacing[0])}</td>
                        <td>The spacing of the input.</td>
                    </tr>
                    <tr>
                        <td>mode</td>
                        <td>{values(modes)}</td>
                        <td>{value(modes[0])}</td>
                        <td>The mode of the input.</td>
                    </tr>
                    <tr>
                        <td>value</td>
                        <td>
                            <code>string</code> | <code>number</code>
                        </td>
                        <td>—</td>
                        <td>The value of the input.</td>
                    </tr>
                    <tr>
                        <td>placeholder</td>
                        <td>
                            <code>string</code> | <code>number</code>
                        </td>
                        <td>—</td>
                        <td>The placeholder of the input, label is used if placeholder omitted.</td>
                    </tr>
                    <tr>
                        <td>label</td>
                        <td>
                            <code>string</code>
                        </td>
                        <td>—</td>
                        <td>The label of the input.</td>
                    </tr>
                    <tr>
                        <td>invalid</td>
                        <td>
                            <code>boolean</code>
                        </td>
                        <td>
                            <code>false</code>
                        </td>
                        <td>Whether the input is invalid.</td>
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
                        <td>Whether the input is disabled.</td>
                    </tr>
                    <tr>
                        <td>fullWidth</td>
                        <td>
                            <code>boolean</code>
                        </td>
                        <td>
                            <code>false</code>
                        </td>
                        <td>Whether the input is full width.</td>
                    </tr>
                </tbody>
            </table>

            <h2>Colors / Variants / States</h2>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<Input color="blue" variant="outlined" />`}
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
                                                    <Input
                                                        variant={variant}
                                                        color={color}
                                                        state={state}
                                                        value={state}
                                                    />
                                                </p>
                                                <p key={state}>
                                                    <Input
                                                        variant={variant}
                                                        color={color}
                                                        placeholder={state}
                                                        state={state}
                                                    />
                                                </p>
                                            </>
                                        ))}
                                        <p key="disabled">
                                            <Input variant={variant} color={color} value="disabled" disabled />
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
                {`<Input size="medium" spacing="large" value="Value" />`}
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
                            <tr key={sp}>
                                <th>
                                    <code data-default={!x}>{sp}</code>
                                </th>
                                {sizes.map((size) => (
                                    <td key={size}>
                                        <Input size={size} spacing={sp} value={`${size}, ${sp}`} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <h2>With decorators</h2>
            <Prism language="tsx" style={{}} useInlineStyles={false}>
                {`<Input
    size="medium"
    spacing="small"
    value="12.34"
    startDecorator="$"
    endDecorator={
        <ButtonGroup>
            <Button size="medium" spacing="small">
                <AddIcon />
            </Button>
            <Button size="medium" spacing="small">
                <RemoveIcon />
            </Button>
        </ButtonGroup>
    }
/>`}
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
                            <tr key={sp}>
                                <th>
                                    <code data-default={!x}>{sp}</code>
                                </th>
                                {sizes.map((size) => (
                                    <td key={size}>
                                        <Input
                                            size={size}
                                            spacing={sp}
                                            value={`${size}, ${sp}`}
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
                                        />
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
                                <Input />
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <code>fullWidth</code>
                            </th>
                            <td>
                                <Input fullWidth />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <h2>Modes</h2>

            <section>
                <table aria-expanded="false">
                    <tbody>
                        {modes.map((mode, m) => (
                            <tr key={m}>
                                <th>
                                    <code data-default={!m}>{mode}</code>
                                </th>
                                <td>
                                    <Input mode={mode} value={data.modes[mode]} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <h2>Label / Error</h2>

            <section>
                {states.map((state, s) => (
                    <>
                        {s ? (
                            <h3>
                                <code>:{state}</code>
                            </h3>
                        ) : null}
                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th colSpan={2}>Valid</th>
                                    <th colSpan={2}>Invalid</th>
                                    <th colSpan={2}>With error</th>
                                </tr>
                                <tr>
                                    <th></th>
                                    <th>No label</th>
                                    <th>With label</th>
                                    <th>No label</th>
                                    <th>With label</th>
                                    <th>No label</th>
                                    <th>With label</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th>No value</th>
                                    <td>
                                        <Input state={state} />
                                    </td>
                                    <td>
                                        <Input state={state} label="Some label" />
                                    </td>
                                    <td>
                                        <Input state={state} invalid />
                                    </td>
                                    <td>
                                        <Input state={state} label="Some label" invalid />
                                    </td>
                                    <td>
                                        <Input state={state} error="Value missing" />
                                    </td>
                                    <td>
                                        <Input state={state} label="Some label" error="Value missing" />
                                    </td>
                                </tr>
                                <tr>
                                    <th>With placeholder</th>
                                    <td>
                                        <Input state={state} placeholder="Enter value" />
                                    </td>
                                    <td>
                                        <Input state={state} placeholder="Enter value" label="Some label" />
                                    </td>
                                    <td>
                                        <Input state={state} placeholder="Enter value" invalid />
                                    </td>
                                    <td>
                                        <Input state={state} placeholder="Enter value" label="Some label" invalid />
                                    </td>
                                    <td>
                                        <Input state={state} placeholder="Enter value" error="Value invalid" />
                                    </td>
                                    <td>
                                        <Input
                                            state={state}
                                            placeholder="Enter value"
                                            label="Some label"
                                            error="Value invalid"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>With value</th>
                                    <td>
                                        <Input state={state} value="value" />
                                    </td>
                                    <td>
                                        <Input state={state} value="value" label="Some label" />
                                    </td>
                                    <td>
                                        <Input state={state} value="value" invalid />
                                    </td>
                                    <td>
                                        <Input state={state} value="value" label="Some label" invalid />
                                    </td>
                                    <td>
                                        <Input state={state} value="value" error="Value invalid" />
                                    </td>
                                    <td>
                                        <Input state={state} value="value" label="Some label" error="Value invalid" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                ))}
            </section>
        </article>
    );
}
