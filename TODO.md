# TODO

- get rid of `punycode`
- fix menu items to have pointer cursor, not only icons
- use `@catppuccin/palette` for colors
- improve loader design by adding more semi-transparent layers
- migrate from webpack to esbuild or vite
- add svg styles (sizes, colors, etc.) so that they can be used as components independently of the IconButton
- extract and reuse common parts from Dropdown and Dialog to separate Popup component
- use docker for deployment
- migrate to mongodb under docker
- ```
    rules: {
        'react-hooks/exhaustive-deps': [
            'error',
            { additionalHooks: '(useUpdateEffect|useDeepMemo)' },
        ],
    },
  ```
- use express-validator:
    - https://express-validator.github.io/docs/
    - https://express-validator.github.io/docs/guides/getting-started/
    - https://medium.com/@techsuneel99/validate-incoming-requests-in-node-js-like-a-pro-95fbdff4bc07
    - https://howtodevez.medium.com/using-express-validator-for-data-validation-in-nodejs-6946afd9d67e
- use React19 action hooks like `useActionState`, `useTransition`, `useOptimistic`
- use React19 server rendering with pre-rendering
