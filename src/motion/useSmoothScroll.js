import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

export function getLenis() {
  return lenisInstance;
}

/** Match ThemeBridge enter expandPortion (slightly past full open). */
const ABOUT_OPEN_PROGRESS = 0.58;
/** Match ContactBridge exit expandPortion (slightly past full open). */
const CONTACT_OPEN_PROGRESS = 0.66;
const HEADER_OFFSET = -72;

function findEnterPin() {
  return ScrollTrigger.getAll().find(
    (st) => st.pin && st.trigger?.classList?.contains('theme-bridge--enter')
  );
}

function findExitPin() {
  return ScrollTrigger.getAll().find(
    (st) => st.pin && st.trigger?.closest?.('.theme-bridge--exit')
  );
}

function scrollYAtProgress(st, progress) {
  if (!st) return null;
  const start = typeof st.start === 'number' ? st.start : 0;
  const end = typeof st.end === 'number' ? st.end : start;
  return start + (end - start) * progress;
}

/**
 * Resolve scroll destination for hash links.
 * Pinned bridge sections need progress past the square expand, not the element top.
 */
function resolveScrollTarget(href) {
  const id = href.slice(1);

  if (id === 'about') {
    const y = scrollYAtProgress(findEnterPin(), ABOUT_OPEN_PROGRESS);
    if (y != null) return { y };
  }

  if (id === 'contact') {
    const y = scrollYAtProgress(findExitPin(), CONTACT_OPEN_PROGRESS);
    if (y != null) return { y };
  }

  const target = document.querySelector(href);
  if (!target) return null;

  // Chapter sections sit after enter pin — use ST so pin-spacer math is correct
  if (id === 'projects' || id === 'experience' || id === 'github' || id === 'hero') {
    const probe = ScrollTrigger.create({
      trigger: target,
      start: `top ${Math.abs(HEADER_OFFSET)}px`,
    });
    const y = probe.start;
    probe.kill();
    if (typeof y === 'number') return { y };
  }

  return { target, offset: HEADER_OFFSET };
}

function useSmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.15,
      autoRaf: false,
    });

    lenisInstance = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const onAnchorClick = (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      // Refresh so pin start/end match current layout before computing destination
      ScrollTrigger.refresh();

      const dest = resolveScrollTarget(href);
      if (!dest) return;

      event.preventDefault();

      if (typeof dest.y === 'number') {
        lenis.scrollTo(dest.y, { duration: 1.15 });
      } else {
        lenis.scrollTo(dest.target, {
          offset: dest.offset ?? HEADER_OFFSET,
          duration: 1.15,
        });
      }
    };

    document.addEventListener('click', onAnchorClick);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);

    const onMotionChange = (event) => {
      if (event.matches) {
        lenis.destroy();
        lenisInstance = null;
        gsap.ticker.remove(tickerCallback);
      }
    };

    reduceMotion.addEventListener?.('change', onMotionChange);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      reduceMotion.removeEventListener?.('change', onMotionChange);
      document.removeEventListener('click', onAnchorClick);
      window.removeEventListener('resize', onResize);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}

export { useSmoothScroll };
