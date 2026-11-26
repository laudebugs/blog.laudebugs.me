import { createCssVariablesTheme } from 'shiki';

// Code colours are CSS variables (--code-*), so every block follows the light and dark tokens in src/styles/code.css.
export const codeTheme = createCssVariablesTheme({ name: 'blog', variablePrefix: '--code-', fontStyle: true });
