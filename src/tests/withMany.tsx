import React, { type PropsWithChildren } from 'react';
import { type RenderOptions } from '@testing-library/react';

export function withMany(...options: Pick<RenderOptions, 'wrapper'>[]) {
    return {
        wrapper: options.reduce(
            (Previous, { wrapper: Wrapper }) =>
                // eslint-disable-next-line react/display-name
                ({ children }: PropsWithChildren) =>
                    Wrapper ? (
                        <Wrapper>
                            <Previous>{children}</Previous>
                        </Wrapper>
                    ) : (
                        <Previous>{children}</Previous>
                    ),
            ({ children }: PropsWithChildren) => children
        ),
    };
}
