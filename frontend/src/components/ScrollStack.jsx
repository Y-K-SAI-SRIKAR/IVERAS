/**
 * ScrollStack — v3 clean rewrite
 *
 * The fundamental bug in v2: recacheOffsets() called getBoundingClientRect()
 * WHILE cards had transforms applied. The cached offsets were therefore
 * shifted by whatever translateY was already on the card → pinEnd was
 * computed from dirty positions → cards stayed pinned past the section.
 *
 * Architecture of this version:
 *
 * 1. MEASURE PHASE (recacheOffsets):
 *    - Temporarily reset ALL card transforms to "none"
 *    - Read getBoundingClientRect() — now reflects true document layout
 *    - Restore transforms immediately after
 *    - Store the true offsets in cardOffsetsRef
 *    - Also store containerTopRef and containerHeightRef (static)
 *
 * 2. SCROLL PHASE (applyTransforms):
 *    - Uses ONLY cached offsets + window.scrollY (no BoundingClientRect)
 *    - pinEnd = containerTopRef + containerHeightRef - vh
 *      → cards release exactly when the section bottom hits the viewport top
 *    - After pinEnd: translateY = 0, cards scroll away naturally
 */

import { useLayoutEffect, useRef, useCallback } from 'react';
import './ScrollStack.css';

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (scrollTop, start, end) => {
  if (scrollTop <= start) return 0;
  if (scrollTop >= end) return 1;
  return (scrollTop - start) / (end - start);
};

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 180,
  itemScale = 0.05,
  itemStackDistance = 55,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  onStackComplete,
}) => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const cardOffsetsRef = useRef([]);   // true doc-top offsets, measured with transforms cleared
  const containerTopRef = useRef(0);   // container's doc-top offset (static)
  const containerHtRef = useRef(0);   // container's natural height (static)
  const rafIdRef = useRef(null);
  const lastValuesRef = useRef([]);
  const stackCompletedRef = useRef(false);
  const resizeObRef = useRef(null);

  const parsePct = useCallback((val) => {
    if (typeof val === 'string' && val.endsWith('%'))
      return (parseFloat(val) / 100) * window.innerHeight;
    return parseFloat(val);
  }, []);

  /* ---------------------------------------------------------
     MEASURE — temporarily clear transforms so BoundingClientRect
     reflects true document layout (not shifted by translateY)
  --------------------------------------------------------- */
  const recacheOffsets = useCallback(() => {
    const cards = cardsRef.current;
    const container = containerRef.current;
    if (!cards.length || !container) return;

    /* 1. Save current transforms */
    const saved = cards.map(c => c.style.transform);

    /* 2. Clear all transforms */
    cards.forEach(c => { c.style.transform = 'none'; });

    /* 3. Measure — getBoundingClientRect now reflects true layout */
    const scrollTop = window.scrollY;
    cardOffsetsRef.current = cards.map(c =>
      c.getBoundingClientRect().top + scrollTop
    );
    const cRect = container.getBoundingClientRect();
    containerTopRef.current = cRect.top + scrollTop;
    containerHtRef.current = cRect.height;

    /* 4. Restore transforms */
    cards.forEach((c, i) => { c.style.transform = saved[i]; });
  }, []);

  /* ---------------------------------------------------------
     SCROLL LOOP — pure arithmetic, zero BoundingClientRect
  --------------------------------------------------------- */
  const applyTransforms = useCallback(() => {
    const scrollTop = window.scrollY;
    const vh = window.innerHeight;
    const stackPx = parsePct(stackPosition);
    const scaleEndPx = parsePct(scaleEndPosition);
    const cards = cardsRef.current;
    const offsets = cardOffsetsRef.current;

    if (!cards.length || !offsets.length) return;

    /*
      pinEnd: the scroll position at which ALL cards should be released.
      = (container bottom) - vh
      When the container bottom edge reaches the viewport top, unpin everything.
      This is 100% static — computed from cached values only.
    */
    const pinEnd = containerTopRef.current + containerHtRef.current - vh;

    /* Which card is on top right now (for blur depth) */
    let topCardIdx = 0;
    for (let j = 0; j < cards.length; j++) {
      const tStart = offsets[j] - stackPx - itemStackDistance * j;
      if (scrollTop >= tStart) topCardIdx = j;
    }

    let anyComplete = false;

    cards.forEach((card, i) => {
      if (!card) return;

      const cardTop = offsets[i];
      const trigStart = cardTop - stackPx - itemStackDistance * i;
      const trigEnd = cardTop - scaleEndPx;
      const pinStart = trigStart;

      /* Scale */
      const scaleP = lerp(scrollTop, trigStart, trigEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleP * (1 - targetScale);

      /* Rotation */
      const rotation = rotationAmount ? i * rotationAmount * scaleP : 0;

      /* Blur */
      let blur = 0;
      if (blurAmount && i < topCardIdx)
        blur = clamp((topCardIdx - i) * blurAmount, 0, 20);

      /* Translation
         - before pinStart → translateY = 0 (card not yet in range)
         - pinned zone     → translate card to stay in viewport
         - after pinEnd    → translateY = 0 (section done, card scrolls naturally)
      */
      const pinned = scrollTop >= pinStart && scrollTop <= pinEnd;
      let translateY = 0;
      if (pinned) {
        translateY = scrollTop - cardTop + stackPx + itemStackDistance * i;
      }

      /* Round to avoid sub-pixel jitter */
      const ty = Math.round(translateY * 10) / 10;
      const sc = Math.round(scale * 1000) / 1000;
      const rot = Math.round(rotation * 10) / 10;
      const bl = Math.round(blur * 10) / 10;

      /* Skip DOM write if unchanged */
      const last = lastValuesRef.current[i];
      const changed = !last || last.ty !== ty || last.sc !== sc
        || last.rot !== rot || last.bl !== bl;

      if (changed) {
        card.style.transform = `translate3d(0,${ty}px,0) scale(${sc}) rotate(${rot}deg)`;
        card.style.filter = bl > 0 ? `blur(${bl}px)` : '';
        lastValuesRef.current[i] = { ty, sc, rot, bl };

        const isMoving = scrollTop > trigStart && scrollTop < pinEnd;
        card.classList.toggle('is-animating', isMoving);
      }

      if (i === cards.length - 1 && pinned) anyComplete = true;
    });

    if (anyComplete && !stackCompletedRef.current) {
      stackCompletedRef.current = true;
      onStackComplete?.();
    } else if (!anyComplete && stackCompletedRef.current) {
      stackCompletedRef.current = false;
    }
  }, [
    parsePct, stackPosition, scaleEndPosition,
    itemStackDistance, itemScale, baseScale,
    rotationAmount, blurAmount, onStackComplete,
  ]);

  /* rAF gate */
  const onScroll = useCallback(() => {
    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      applyTransforms();
    });
  }, [applyTransforms]);

  /* Setup */
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.scroll-stack-card'));
    cardsRef.current = cards;
    lastValuesRef.current = cards.map(() => null);

    cards.forEach((card, i) => {
      card.style.marginBottom = i < cards.length - 1 ? `${itemDistance}px` : '15vh';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
    });

    /* Measure after a frame so the browser has laid out margin changes */
    const measureAndDraw = () => { recacheOffsets(); applyTransforms(); };
    requestAnimationFrame(measureAndDraw);

    /* Re-measure on resize — reset transforms first so measurement is clean */
    resizeObRef.current = new ResizeObserver(() => {
      cards.forEach(c => { c.style.transform = 'none'; });
      lastValuesRef.current = cards.map(() => null);
      requestAnimationFrame(measureAndDraw);
    });
    resizeObRef.current.observe(document.documentElement);

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      resizeObRef.current?.disconnect();
      cardsRef.current = [];
      lastValuesRef.current = [];
      cardOffsetsRef.current = [];
      stackCompletedRef.current = false;
    };
  }, [itemDistance, recacheOffsets, applyTransforms, onScroll]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={containerRef}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;