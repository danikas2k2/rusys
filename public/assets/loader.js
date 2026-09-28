(function () {
  document.documentElement.setAttribute(
    'data-mantine-color-scheme',
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
})();
