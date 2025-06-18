import React, { type CSSProperties, type JSX } from 'react';
import { colors, schemes } from './element';

function Box({
    color,
    background,
    border,
    style,
    children,
}: {
    color?: string;
    background?: string;
    border?: string;
    style?: CSSProperties;
    children: string;
}) {
    return (
        <div
            style={{
                color,
                background,
                border: border && `1px solid ${border}`,
                borderRadius: 'var(--radius-medium)',
                padding: '1rem .25rem',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                ...style,
            }}
        >
            {children}
        </div>
    );
}

export default function ColorsArticle(): JSX.Element {
    const textColors = ['text', 'subtext1', 'subtext0'];
    const bgColors = [
        'base',
        'mantle',
        'crust',
        'surface0',
        'surface1',
        'surface2',
        'overlay0',
        'overlay1',
        'overlay2',
    ];
    const shadows = ['xsmall', 'small', 'medium', 'large', 'xlarge'];

    return (
        <article>
            <h1>Colors</h1>

            <h2>Text variables</h2>

            {schemes.map((scheme) => (
                <section key={scheme} data-color-scheme={scheme}>
                    <table>
                        <tbody>
                            {textColors.map((color) => (
                                <tr key={color}>
                                    <th>
                                        <code>--color-{color}:</code>
                                    </th>
                                    <td>
                                        <Box
                                            style={{
                                                color: 'var(--color-base)',
                                                background: `var(--color-${color})`,
                                                border: '1px solid var(--color-base)',
                                            }}
                                        >
                                            {color}
                                        </Box>
                                    </td>
                                    <td>
                                        <Box
                                            style={{
                                                color: `var(--color-${color})`,
                                                background: 'var(--color-base)',
                                                border: `1px solid var(--color-${color})`,
                                            }}
                                        >
                                            {color}
                                        </Box>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            ))}

            <h2>Background variables</h2>

            {schemes.map((scheme) => (
                <section key={scheme} data-color-scheme={scheme}>
                    <table>
                        <tbody>
                            {bgColors.map((color) => (
                                <tr key={color}>
                                    <th>
                                        <code>--color-{color}:</code>
                                    </th>
                                    <td>
                                        <Box
                                            style={{
                                                color: 'var(--color-text)',
                                                background: `var(--color-${color})`,
                                                border: '1px solid var(--color-text)',
                                            }}
                                        >
                                            {color}
                                        </Box>
                                    </td>
                                    <td>
                                        <Box
                                            style={{
                                                color: `var(--color-${color})`,
                                                background: 'var(--color-text)',
                                                border: `1px solid var(--color-${color})`,
                                            }}
                                        >
                                            {color}
                                        </Box>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            ))}

            <h2>Color variables</h2>

            {schemes.map((scheme) => (
                <section key={scheme} data-color-scheme={scheme}>
                    <table>
                        <tbody>
                            {colors.slice(1).map((color) => (
                                <tr key={color}>
                                    <th>
                                        <code>--color-{color}:</code>
                                    </th>
                                    <td>
                                        <Box
                                            style={{
                                                color: 'var(--color-base)',
                                                background: `var(--color-${color})`,
                                                border: '1px solid var(--color-base)',
                                            }}
                                        >
                                            {color}
                                        </Box>
                                    </td>
                                    <td>
                                        <Box
                                            style={{
                                                color: `var(--color-${color})`,
                                                background: 'var(--color-base)',
                                                border: `1px solid var(--color-${color})`,
                                            }}
                                        >
                                            {color}
                                        </Box>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            ))}

            <h2>Shadow variables</h2>

            {schemes.map((scheme) => (
                <section key={scheme} data-color-scheme={scheme}>
                    <table>
                        <tbody>
                            {shadows.map((variant) => (
                                <tr key={variant}>
                                    <th>
                                        <code>--shadow-{variant}:</code>
                                    </th>
                                    <td>
                                        <Box
                                            style={{
                                                color: 'var(--color-text)',
                                                background: 'var(--color-surface0)',
                                                boxShadow: `var(--shadow-${variant})`,
                                            }}
                                        >
                                            {variant}
                                        </Box>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            ))}

            <h2>Mix colors</h2>

            <p>Special colors to be mixed with other colors to make them stronger (darker) or softer (lighter).</p>

            {schemes.map((scheme) => (
                <section key={scheme} data-color-scheme={scheme}>
                    <table>
                        <tbody>
                            <tr key="soft">
                                <th>
                                    <code>--color-soft:</code>
                                </th>
                                <td>
                                    <Box style={{ color: 'var(--color-strong)', background: 'var(--color-soft)' }}>
                                        soft
                                    </Box>
                                </td>
                            </tr>
                            <tr key="strong">
                                <th>
                                    <code>--color-strong:</code>
                                </th>
                                <td>
                                    <Box style={{ color: 'var(--color-soft)', background: 'var(--color-strong)' }}>
                                        strong
                                    </Box>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            ))}
        </article>
    );
}
