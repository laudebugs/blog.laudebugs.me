/** The two themes the toggle chooses between. With no choice stored, the page follows the system setting. */
export type Theme = 'light' | 'dark';

export const THEME_KEY = 'theme';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/** The theme the page shows, given what is stored and what the system prefers. */
export function effectiveTheme(stored: unknown, systemPrefersDark: boolean): Theme {
  if (isTheme(stored)) return stored;
  return systemPrefersDark ? 'dark' : 'light';
}

export function otherTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}

/**
 * Runs in the head before the first paint, so there is no flash of the wrong theme.
 * It is a string so the layout can inline it and the tests can run the very same code.
 * Storage can throw (private windows, blocked site data), so every read is guarded.
 */
export const themeInit = `(function () {
  try {
    var stored = localStorage.getItem('${THEME_KEY}');
    if (stored === 'light' || stored === 'dark') document.documentElement.dataset.theme = stored;
  } catch (error) {}
})();`;
