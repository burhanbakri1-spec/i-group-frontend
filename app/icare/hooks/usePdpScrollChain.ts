import { RefObject, useEffect } from 'react';

const DESKTOP_MQ = '(min-width: 821px)';
/** Multiplier applied to wheel delta when scrolling the info panel. */
const PANEL_WHEEL_SPEED = 2;

/**
 * Rhode Product__new scroll model — asymmetric wheel-intercept.
 *
 * Scroll DOWN (over the section):
 *   Panel not at bottom → consume delta in panel; page does not scroll.
 *   Panel at bottom     → fall through; page scrolls normally.
 *
 * Scroll UP (over the section):
 *   Page is still below the section anchor → fall through; page scrolls up first.
 *   Page has returned to the section anchor AND panel not at top
 *     → consume delta in panel; page does not scroll.
 *   Panel reaches top   → fall through; page continues scrolling up.
 *
 * "Section anchor" = absolute section top minus the sticky header height.
 * Using this asymmetric rule gives the Rhode-style experience where
 * scrolling up first brings the page back to the product block, then the
 * info panel scrolls up — no bidirectional sync, no feedback loops.
 */
export const usePdpScrollChain = (
  sectionRef: RefObject<HTMLElement | null>,
  _gridRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
) => {
  useEffect(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    if (!section || !panel) return;

    const mq = window.matchMedia(DESKTOP_MQ);

    /**
     * The scroll-Y position at which the section's top edge meets the bottom
     * of the sticky header. Below this value the product block is fully visible;
     * above it we should let the page scroll back down to it first.
     */
    const getSectionAnchor = (): number => {
      const headerEl = document.querySelector<HTMLElement>('[data-icare-header]');
      const stickyBottom = headerEl
        ? headerEl.getBoundingClientRect().bottom
        : 80;
      const sectionAbsTop = section.getBoundingClientRect().top + window.scrollY;
      return Math.max(0, sectionAbsTop - stickyBottom);
    };

    const onWheel = (e: WheelEvent) => {
      if (!mq.matches) return;

      const range = panel.scrollHeight - panel.clientHeight;
      if (range <= 0) return;

      const delta = e.deltaY * PANEL_WHEEL_SPEED;
      const scrollingDown = delta > 0;
      const atBottom = panel.scrollTop >= range - 1;
      const atTop = panel.scrollTop <= 0;

      if (scrollingDown && !atBottom) {
        // Panel still has room → consume here; page stays put.
        e.preventDefault();
        panel.scrollTop = Math.min(panel.scrollTop + delta, range);
      } else if (!scrollingDown && !atTop) {
        // Panel has content to scroll up — but only after the page has returned
        // to the section anchor. Until then, let the page scroll up first.
        const anchor = getSectionAnchor();
        if (window.scrollY <= anchor + 2) {
          e.preventDefault();
          panel.scrollTop = Math.max(panel.scrollTop + delta, 0);
        }
      }
      // All other cases: panel at its limit → fall through so the page scrolls.
    };

    // capture:true — fires before the browser scrolls the panel natively,
    // so preventDefault() can prevent panel AND page scroll as needed.
    section.addEventListener('wheel', onWheel, { passive: false, capture: true });

    return () => {
      section.removeEventListener('wheel', onWheel, { capture: true });
    };
  }, [sectionRef, _gridRef, panelRef]);
};
