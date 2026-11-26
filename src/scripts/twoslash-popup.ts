/**
 * Shows a twoslash type popup next to its token, outside the code block.
 *
 * The popup lives inside the scrolling <pre>, which clips anything past its edges, so a popup near the right edge or
 * the last lines was cut off. While the pointer is on a token, a copy of its popup is placed at the end of <body> and
 * positioned to fit the window.
 */

const GAP = 6;
const MARGIN = 8;

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Where to put a popup of this size under (or, if it does not fit, over) the token, kept inside the window. */
export function placePopup(
  token: Box,
  popup: { width: number; height: number },
  view: { width: number; height: number },
) {
  const maxLeft = Math.max(MARGIN, view.width - popup.width - MARGIN);
  const left = Math.min(Math.max(token.left, MARGIN), maxLeft);
  const below = token.bottom + GAP;
  const fitsBelow = below + popup.height <= view.height - MARGIN;
  const above = token.top - GAP - popup.height;
  const top = fitsBelow || above < MARGIN ? below : above;
  return { left, top };
}

export function initTwoslashPopups(): void {
  document.documentElement.dataset.floatPopups = '';
  let floating: HTMLElement | null = null;

  const hide = () => {
    floating?.remove();
    floating = null;
  };

  const show = (token: Element) => {
    const source = token.querySelector(':scope > .twoslash-popup-container');
    if (!source) return;
    hide();
    const wrapper = document.createElement('div');
    wrapper.className = 'code-frame twoslash-float';
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.append(source.cloneNode(true));
    document.body.append(wrapper);
    const rect = token.getBoundingClientRect();
    const size = wrapper.getBoundingClientRect();
    const { left, top } = placePopup(rect, size, { width: window.innerWidth, height: window.innerHeight });
    wrapper.style.left = `${left + window.scrollX}px`;
    wrapper.style.top = `${top + window.scrollY}px`;
    floating = wrapper;
  };

  document.addEventListener('pointerover', (event) => {
    const token = (event.target as Element).closest?.('.code-frame .twoslash-hover, .code-frame .twoslash-error-hover');
    if (token && !token.matches('.twoslash-query-persisted *')) show(token);
  });
  document.addEventListener('pointerout', (event) => {
    const to = event.relatedTarget as Element | null;
    if (!to?.closest?.('.twoslash-float')) {
      const from = (event.target as Element).closest?.('.twoslash-hover, .twoslash-error-hover');
      if (from && !from.contains(to)) hide();
    }
  });
  window.addEventListener('scroll', hide, { passive: true });
}
