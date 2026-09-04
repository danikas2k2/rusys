import type { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';

type CatppuccinColors = 'flamingo' | 'lavender' | 'maroon' | 'mauve' | 'peach' | 'rosewater' | 'sapphire' | 'sky';
type VirtualColors = 'primary' | 'secondary' | 'positive' | 'negative' | 'neutral';

declare module '@mantine/core' {
    export interface MantineThemeColorsOverride {
        colors: Record<DefaultMantineColor | CatppuccinColors | VirtualColors, MantineColorsTuple>;
    }
}
