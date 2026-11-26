import { describe, expect, it } from 'vitest';
import { effectiveTheme, isTheme, otherTheme, themeInit } from '../src/scripts/theme';

describe('effectiveTheme', () => {
  it('uses the stored choice over the system setting', () => {
    expect(effectiveTheme('light', true)).toBe('light');
    expect(effectiveTheme('dark', false)).toBe('dark');
  });

  it('follows the system when nothing valid is stored', () => {
    expect(effectiveTheme(null, true)).toBe('dark');
    expect(effectiveTheme(null, false)).toBe('light');
    expect(effectiveTheme('purple', false)).toBe('light');
  });

  it('flips between the two themes', () => {
    expect(otherTheme('dark')).toBe('light');
    expect(otherTheme('light')).toBe('dark');
    expect(isTheme('system')).toBe(false);
  });
});

// The head script is a string, so these tests run the same code the page runs.
function runInit(getItem: (key: string) => string | null) {
  const root = { dataset: {} as Record<string, string> };
  new Function('document', 'localStorage', themeInit)({ documentElement: root }, { getItem });
  return root.dataset.theme;
}

describe('themeInit', () => {
  it('sets the stored theme before first paint', () => {
    expect(runInit(() => 'dark')).toBe('dark');
    expect(runInit(() => 'light')).toBe('light');
  });

  it('sets nothing when no valid theme is stored, so the system setting applies', () => {
    expect(runInit(() => null)).toBeUndefined();
    expect(runInit(() => 'sepia')).toBeUndefined();
  });

  it('does not throw when storage is blocked', () => {
    expect(
      runInit(() => {
        throw new Error('blocked');
      }),
    ).toBeUndefined();
  });
});
