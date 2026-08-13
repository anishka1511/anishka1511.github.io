import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

export function getLenis() {
  return lenisInstance;
}

export function useSmoothScroll() {
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

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, {
        offset: -72,
        duration: 1.15,
      });
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
