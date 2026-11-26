import { describe, expect, it } from 'vitest';
import { formatDate, headingHtml } from '../src/lib/text';

describe('headingHtml', () => {
  it('turns backtick spans into code elements and leaves the rest as it is', () => {
    expect(headingHtml('Referencing `viewChild` queries within `@defer` blocks')).toBe(
      'Referencing <code>viewChild</code> queries within <code>@defer</code> blocks',
    );
  });

  it('escapes HTML in both plain text and code', () => {
    expect(headingHtml('Use <b> & `<div>`')).toBe('Use &lt;b&gt; &amp; <code>&lt;div&gt;</code>');
  });

  it('keeps spaces and punctuation readable (no URL encoding)', () => {
    expect(headingHtml("A More Type Safe-ish Angular Router: it's here")).toBe(
      "A More Type Safe-ish Angular Router: it's here",
    );
  });
});

describe('formatDate', () => {
  it('formats a day without shifting it by the time zone', () => {
    expect(formatDate('2026-01-01')).toBe('January 1, 2026');
    expect(formatDate('2025-12-31')).toBe('December 31, 2025');
  });
});
