import { getTheme } from './theme';

describe('theme', () => {
    it('includes component configurations with accessibility defaults', () => {
        const theme = getTheme();

        expect(theme.respectReducedMotion).toBe(true);

        expect(theme.components).toMatchObject({
            Alert: { defaultProps: { role: 'alert' } },
            Loader: { defaultProps: { role: 'progressbar' } },
            InputError: { defaultProps: { role: 'alert' } },
            Modal: {
                defaultProps: {
                    overlayProps: { role: 'complementary' },
                    transitionProps: {
                        transition: 'fade-down',
                        duration: 200,
                        timingFunction: 'ease-out',
                    },
                },
            },
        });
    });
});
