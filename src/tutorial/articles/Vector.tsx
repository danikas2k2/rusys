import cx from './Vector.less';
import { type PropsWithChildren } from 'react';

const xOffset = 0;
const yOffset = 450;
const scale = 100;

function x(v: number) {
    return xOffset + v;
}

function y(v: number) {
    return yOffset - v;
}

function scaled(v: number) {
    return v * scale;
}

function X(v: number) {
    return x(scaled(v));
}

function Y(v: number) {
    return y(scaled(v));
}

function Dot({ x, y, color, children }: PropsWithChildren<{ x: number; y: number; color?: string }>) {
    return (
        <>
            <circle cx={X(x)} cy={Y(y)} r="10" fill={color} />
            {children && (
                <text x={X(x) - 30} y={Y(y) - 10}>
                    {children}
                </text>
            )}
        </>
    );
}

interface LineStyle {
    color?: string;
    stroke?: number;
    dotted?: boolean;
}

interface LineProps extends LineStyle {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

function LineText({ x1, y1, x2, y2, color, vector, children }: PropsWithChildren<LineProps & { vector?: boolean }>) {
    return (
        <text
            x={X(x1 + (x2 - x1) / 2) - 30}
            y={Y(y1 + (y2 - y1) / 2) - 10}
            color={color}
            style={vector ? { textDecorationLine: 'overline' } : undefined}
        >
            {children}
        </text>
    );
}

function Line({ x1, y1, x2, y2, color, stroke = 4, dotted = false, children }: PropsWithChildren<LineProps>) {
    return (
        <>
            <line
                x1={X(x1)}
                y1={Y(y1)}
                x2={X(x2)}
                y2={Y(y2)}
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={dotted ? `${scaled(0.05)} ${scaled(0.1)}` : undefined}
            />
            {children && (
                <LineText x1={x1} x2={x2} y1={y1} y2={y2} color={color}>
                    {children}
                </LineText>
            )}
        </>
    );
}

interface VectorProps extends LineStyle {
    x0?: number;
    y0?: number;
    x: number;
    y: number;
}

function Vector({ x0 = 0, y0 = 0, x, y, color, stroke = 4, dotted = false, children }: PropsWithChildren<VectorProps>) {
    const x1 = x + x0;
    const y1 = y + y0;
    const len = Math.sqrt(x * x + y * y);
    const i = x / len;
    const j = y / len;

    const xArrow = 0.3;
    const yArrow = 0.1;

    return (
        <>
            <path
                d={`M ${X(x1 - xArrow * i - yArrow * j)} ${Y(y1 - xArrow * j + yArrow * i)} L ${X(x1)} ${Y(y1)} L ${X(x1 - xArrow * i + yArrow * j)} ${Y(y1 - xArrow * j - yArrow * i)}`}
                fill={color}
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={dotted ? `${scaled(0.05)} ${scaled(yArrow)}` : undefined}
            />
            <Line x1={x0} y1={y0} x2={x1} y2={y1} color={color} stroke={stroke} dotted={dotted} />
            {children && (
                <LineText x1={x0} x2={x1} y1={y0} y2={y1} color={color} vector>
                    {children}
                </LineText>
            )}
        </>
    );
}

function Zero() {
    return (
        <text x={X(-0.4)} y={Y(-0.4)}>
            0
        </text>
    );
}

interface XAxisProps {
    x0?: number;
    y0?: number;
    x: number;
}

function XAxis({ x0 = 0, y0 = 0, x, children = 'x' }: PropsWithChildren<XAxisProps>) {
    const ticks = Array(x - x0 - 1)
        .fill(0)
        .map((v, i) => {
            const xt = x0 + 1 + i;
            return xt ? (
                <>
                    <XTick x={xt} />
                    <text x={X(xt - 0.1)} y={Y(y0 - 0.5)}>
                        {xt}
                    </text>
                </>
            ) : null;
        });
    return (
        <>
            <Vector x0={-1} y0={0} x={x - x0} y={0} stroke={2} />
            <text x={X(x + 0.1)} y={Y(y0 - 0.4)}>
                {children}
            </text>
            {ticks}
        </>
    );
}

interface YAxisProps {
    x0?: number;
    y0?: number;
    y: number;
}

function YAxis({ x0 = 0, y0 = 0, y, children = 'y' }: PropsWithChildren<YAxisProps>) {
    const ticks = Array(y - y0 - 1)
        .fill(0)
        .map((v, i) => {
            const yt = y0 + 1 + i;
            return yt ? (
                <>
                    <YTick y={yt} />
                    <text y={Y(yt - 0.1)} x={X(x0 - 0.5)} color="gray">
                        {yt}
                    </text>
                </>
            ) : null;
        });
    return (
        <>
            <Vector x0={0} y0={-1} x={0} y={y - y0} stroke={2} />
            <text x={X(x0 - 0.4)} y={Y(y)}>
                {children}
            </text>
            {ticks}
        </>
    );
}

function XTick({ x, color, stroke, dotted }: { x: number } & LineStyle) {
    return <Line x1={x} y1={0} x2={x} y2={-0.1} color={color} stroke={stroke} dotted={dotted} />;
}

function YTick({ y, color, stroke, dotted }: { y: number } & LineStyle) {
    return <Line x1={0} y1={y} x2={-0.1} y2={y} color={color} stroke={stroke} dotted={dotted} />;
}

function Text({ x, y, children }: PropsWithChildren<{ x: number; y: number }>) {
    return (
        <foreignObject x={X(x) - 10} y={Y(y)} width={scaled(1)} height={scaled(1)} className={cx('text')}>
            {children}
        </foreignObject>
    );
}

export default function Vectors() {
    return (
        <article>
            <h1>Vektoriai</h1>

            <section>
                <svg viewBox="-100 -100 650 650">
                    <XAxis x0={-1} x={5} />
                    <YAxis y0={-1} y={5} />
                    <Zero />

                    <Vector x0={1} y0={1} x={2} y={1} />
                    <Dot x={1} y={1}>
                        A
                    </Dot>
                    <Dot x={3} y={2}>
                        B
                    </Dot>

                    <Line x1={1} y1={1} x2={1} y2={0} dotted color="blue" stroke={2} />
                    <Text x={1} y={-0.5}>
                        x<sub>1</sub>
                    </Text>

                    <Line x1={3} y1={2} x2={3} y2={0} dotted color="blue" stroke={2} />
                    <Text x={3} y={-0.5}>
                        x<sub>2</sub>
                    </Text>

                    <Line x1={1} y1={1} x2={0} y2={1} dotted color="blue" stroke={2} />
                    <Text x={-0.75} y={1.25}>
                        y<sub>1</sub>
                    </Text>

                    <Line x1={3} y1={2} x2={0} y2={2} dotted color="blue" stroke={2} />
                    <Text x={-0.75} y={2.25}>
                        y<sub>2</sub>
                    </Text>

                    <Line x1={1} y1={0} x2={3} y2={0} color="green" stroke={8} />
                    <Dot x={1} y={0} color="green" />
                    <Dot x={3} y={0} color="green" />

                    <Line x1={0} y1={1} x2={0} y2={2} color="darkred" stroke={8} />
                    <Dot x={0} y={1} color="darkred" />
                    <Dot x={0} y={2} color="darkred" />
                </svg>
                <div>
                    <p>Turime taškus A ir B. Tašku kordinatės: A(1;1) ir B(3;2).</p>
                    <p>
                        <ins>AB</ins> yra vektorius iš taško A i taška B.
                    </p>
                    <p>
                        Jei tasko A koordinatės (x<sub>A</sub> ; y<sub>A</sub>), o taško B (x<sub>B</sub> ; y
                        <sub>B</sub>), tuomet vektoriu skaiciuojam atimdami pradini taška iš galutinio:
                    </p>
                    <p>
                        <ins>AB</ins> = B – A = (x<sub>B</sub>–x<sub>A</sub> ; y<sub>B</sub>–y<sub>A</sub>) = (
                        <b style={{ color: 'green' }}>Δx</b> ; <b style={{ color: 'darkred' }}>Δy</b>)
                    </p>
                    <p>Δx ir Δy yra kelias, nueitas x ir y ašimis is taško A i taska B.</p>
                    <p>
                        <ins>AB</ins> = (3–1 ; 2–1) = (2;1)
                    </p>
                    <p>
                        Šiuo atveju, <b style={{ color: 'green' }}>Δx</b> yra <ins>AB</ins> vektoriaus projekcija i x
                        aši, o <b style={{ color: 'darkred' }}>Δy</b> — projekcija i y aši.
                    </p>
                </div>
            </section>

            <section>
                <svg viewBox="-100 -100 650 650">
                    <XAxis x0={-1} x={5} />
                    <YAxis y0={-1} y={5} />
                    <Zero />

                    <Vector x0={1} y0={1} x={2} y={1} />
                    <Dot x={1} y={1}>
                        A
                    </Dot>
                    <Dot x={3} y={2}>
                        B
                    </Dot>

                    <Vector x0={1} y0={3} x={2} y={1} color="darkblue" />
                    <Dot x={1} y={3} color="darkblue">
                        C
                    </Dot>
                    <Dot x={3} y={4} color="darkblue">
                        D
                    </Dot>

                    <Vector x0={2} y0={-0.5} x={2} y={1} color="indigo" />
                    <Dot x={2} y={-0.5} color="indigo">
                        E
                    </Dot>
                    <Dot x={4} y={0.5} color="indigo">
                        F
                    </Dot>
                </svg>
                <div>
                    <p>Turime taškus A(1;1), B(3;2), C(1;3), D(3;4), E(2;–0.5), F(4;0.5).</p>
                    <p>
                        <ins>AB</ins> = (3–1; 2–1) = (2;1)
                    </p>
                    <p>
                        <ins>CD</ins> = (3–1; 4–3) = (2;1)
                    </p>
                    <p>
                        <ins>EF</ins> = (4–2; 0.5–(–0.5)) = (2;1)
                    </p>
                    <p>
                        Nepriklausomai nuo to, kur prasideda vektoriai ir kur baigiasi, jie yra lygys, t.y. turi tas
                        pacias "koordinates".
                    </p>
                    <p>
                        <ins>AB</ins> = <ins>CD</ins> = <ins>EF</ins>
                    </p>
                </div>
            </section>

            <section>
                <div />
                <div>
                    <p>Turint vektoriu ir vieno iš tašku koordinactes, galima rasti kito taško koordinates.</p>
                    <p>
                        Turime vektoriu <ins>AB</ins> = (x<sub>AB</sub> ; y<sub>AB</sub>).
                    </p>
                    <p>
                        Jei turime pradini taska A(x<sub>A</sub> ; y<sub>A</sub>), galutini taska B gausime prie
                        pradinio prideje vektoriu AB:
                    </p>
                    <p>
                        B = A + <ins>AB</ins> = (x<sub>A</sub> + x<sub>AB</sub> ; y<sub>A</sub> + y<sub>AB</sub>)
                    </p>
                    <p>
                        Analogiškai, jei turime galutini taska B(x<sub>B</sub> ; y<sub>B</sub>), pradini taska A gausime
                        is galutinio ateme vektoriu AB:
                    </p>
                    <p>
                        A = B – <ins>AB</ins> = (x<sub>B</sub> – x<sub>AB</sub> ; y<sub>B</sub> – y<sub>AB</sub>)
                    </p>
                </div>
            </section>

            <h1>Vektoriaus daugyba iš skaičiaus</h1>

            <section>
                <svg viewBox="-100 -100 650 650">
                    <XAxis x0={-1} x={5} />
                    <YAxis y0={-1} y={5} />
                    <Zero />

                    <Vector x0={1} y0={1} x={2} y={1} />
                    <Dot x={1} y={1}>
                        A
                    </Dot>
                    <Dot x={3} y={2}>
                        B
                    </Dot>

                    <Vector x0={0} y0={2} x={4} y={2} color="darkblue" />
                    <Dot x={0} y={2} color="darkblue">
                        C
                    </Dot>
                    <Dot x={4} y={4} color="darkblue">
                        D
                    </Dot>

                    <Vector x0={4} y0={1.5} x={-2} y={-1} color="indigo" />
                    <Dot x={4} y={1.5} color="indigo">
                        E
                    </Dot>
                    <Dot x={2} y={0.5} color="indigo">
                        F
                    </Dot>
                </svg>
                <div>
                    <p>Turime taškus A(1;1), B(3;2), C(0;2), D(4;4), E(4;1.5), F(2;0.5).</p>
                    <p>
                        <ins>AB</ins> = (3–1; 2–1) = (2;1)
                    </p>
                    <p>
                        <ins>CD</ins> = (4–0; 4–2) = (4;2) = (2⋅2;2⋅1) = 2⋅(2;1) = 2⋅
                        <ins>AB</ins>
                    </p>
                    <p>
                        <ins>EF</ins> = (2–4; 0.5–1.5) = (–2;–1) = (–1⋅2;–1⋅1) = –1⋅(2;1) = –<ins>AB</ins>
                    </p>
                    <p>
                        Padauginti vektoriu iš skaičiaus, reiškia visas jo koordinates padauginti arba padalinti iš to
                        paties skaičiaus.
                    </p>
                    <p>
                        Jei <ins>AB</ins> = (x;y), tuomet N⋅
                        <ins>AB</ins> = N⋅(x;y) = (N⋅x ; N⋅y)
                    </p>
                </div>
            </section>
        </article>
    );
}
