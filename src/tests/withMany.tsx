import { type RenderOptions } from '@testing-library/react';
import React, { type PropsWithChildren } from 'react';

export function withMany(...options: Pick<RenderOptions, 'wrapper'>[]) {
    return {
        wrapper: options.reduce(
            (Previous, { wrapper: Wrapper }) =>
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
