import { effectiveTheme, isTheme, otherTheme, THEME_KEY } from './theme';

/** Wires every theme toggle button on the page: a click flips the theme and remembers the choice. */
export function initThemeToggle(): void {
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  const current = () => {
    const shown = root.dataset.theme;
    return isTheme(shown) ? shown : effectiveTheme(null, systemDark.matches);
  };

  const sync = () => {
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
      const next = otherTheme(current());
      button.hidden = false;
      button.textContent = next;
      button.setAttribute('aria-label', `Switch to the ${next} theme`);
    }
  };

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    button.addEventListener('click', () => {
      const next = otherTheme(current());
      root.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // Storage is blocked: the choice lasts for this page view only.
      }
      sync();
    });
  }

  systemDark.addEventListener('change', sync);
  sync();
}
