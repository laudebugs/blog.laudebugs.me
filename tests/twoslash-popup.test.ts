import { describe, expect, it } from 'vitest';
import { placePopup } from '../src/scripts/twoslash-popup';

const view = { width: 1000, height: 700 };
const popup = { width: 300, height: 80 };

describe('placePopup', () => {
  it('opens under the token, starting at its left edge', () => {
    expect(placePopup({ left: 100, top: 200, right: 160, bottom: 220 }, popup, view)).toEqual({ left: 100, top: 226 });
  });

  it('keeps a popup inside the right edge of the window', () => {
    const { left } = placePopup({ left: 900, top: 200, right: 960, bottom: 220 }, popup, view);
    expect(left + popup.width).toBeLessThanOrEqual(view.width - 8);
  });

  it('flips above the token when there is no room below', () => {
    const { top } = placePopup({ left: 100, top: 640, right: 160, bottom: 660 }, popup, view);
    expect(top).toBe(640 - 6 - popup.height);
  });

  it('stays below when it fits neither way', () => {
    const { top } = placePopup({ left: 100, top: 20, right: 160, bottom: 40 }, { width: 300, height: 700 }, view);
    expect(top).toBe(46);
  });

  it('never starts left of the window', () => {
    expect(placePopup({ left: -50, top: 200, right: 0, bottom: 220 }, popup, view).left).toBe(8);
  });
});
