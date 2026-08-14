/**
 * SVG mock for Vitest — mirrors what jest-transformer-svg produces.
 *
 * jest-transformer-svg renders an <svg> element and forwards `className`
 * through `classNames(...)` so snapshot tests keep the same shape.
 */
import classNames from 'classnames';
import React from 'react';

interface SvgProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

const SvgMock: React.FC<SvgProps> = ({ className, ...rest }) => (
    <svg className={classNames(className)} {...rest} />
);

export default SvgMock;

// Named re-export so both `import Foo from '*.svg'` and `import { ReactComponent as Foo } from '*.svg'` work
export { SvgMock as ReactComponent };
