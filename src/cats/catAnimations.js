import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function randomBetween([min, max]) {
  return min + Math.random() * (max - min);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Map peek direction → hidden / shown transform props */
export function getPeekOffsets(direction = 'bottom') {
  switch (direction) {
    case 'top':
      return {
        hidden: { xPercent: 0, yPercent: -108 },
        shown: { xPercent: 0, yPercent: -32 },
      };
    case 'left':
      return {
        hidden: { xPercent: -108, yPercent: 0 },
        shown: { xPercent: -32, yPercent: 0 },
      };
    case 'right':
      return {
        hidden: { xPercent: 108, yPercent: 0 },
        shown: { xPercent: 32, yPercent: 0 },
      };
    case 'bottom':
    default:
      return {
        hidden: { xPercent: 0, yPercent: 108 },
        shown: { xPercent: 0, yPercent: 35 },
      };
  }
}

function flickTail(root) {
  const tail = root.querySelector('.cat-tail');
  if (!tail) return;
  gsap.fromTo(
    tail,
    { rotation: -18, transformOrigin: '10% 90%' },
    {
      rotation: 14,
      duration: 0.22,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
    }
  );
}

/**
 * Fast timed peek / hide from any direction.
 * Defaults match the hero/project peek feel.
 */
export function animatePeekLoop(root, config = {}) {
  const direction = config.direction || 'bottom';
  const { hidden, shown } = getPeekOffsets(direction);

  if (prefersReducedMotion()) {
    gsap.set(root, { ...shown, opacity: 0.75 });
    return () => {};
  }

  const cat = root.querySelector('.cat-drawing');
  gsap.set(root, { ...hidden, opacity: 1, xPercent: hidden.xPercent, yPercent: hidden.yPercent });

  let killed = false;
  const tl = gsap.timeline({ paused: true });

  const runCycle = () => {
    if (killed) return;
    tl.clear();
    tl.to(root, {
      ...shown,
      duration: config.peekDuration ?? 0.4,
      ease: 'power2.out',
      onStart: () => flickTail(root),
    })
      .to(cat, { rotation: direction === 'left' || direction === 'right' ? 0 : -3, duration: 0.2, ease: 'sine.out' }, '-=0.1')
      .to(cat, { rotation: direction === 'left' || direction === 'right' ? 0 : 4, duration: 0.25, ease: 'sine.inOut' })
      .to(cat, { rotation: 0, duration: 0.2, ease: 'sine.inOut' })
      .to({}, { duration: randomBetween(config.visiblePause ?? [0.8, 1.6]) })
      .to(root, {
        ...hidden,
        duration: config.hideDuration ?? 0.35,
        ease: 'power2.in',
      })
      .to({}, { duration: randomBetween(config.hiddenPause ?? [2.5, 5]) })
      .call(runCycle);
    tl.play(0);
  };

  const startDelay = gsap.delayedCall(
    randomBetween(config.startDelay ?? [0.8, 2.2]),
    runCycle
  );

  return () => {
    killed = true;
    startDelay.kill();
    tl.kill();
  };
}

/** Cursor proximity: look / hide when pointer nears hotspot */
export function animateCursorReaction(root, hotspot, config = {}) {
  if (prefersReducedMotion() || !isFinePointer()) {
    return () => {};
  }

  const direction = config.direction || 'bottom';
  const { hidden } = getPeekOffsets(direction);
  const cat = root.querySelector('.cat-drawing');
  let hiding = false;
  let resumeTimer = null;

  const onMove = (event) => {
    if (!hotspot || hiding) return;
    const rect = hotspot.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(event.clientX - cx, event.clientY - cy);

    if (dist < 70) {
      hiding = true;
      gsap.to(root, { ...hidden, duration: 0.28, ease: 'power2.in' });
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        hiding = false;
      }, 2000);
      return;
    }

    if (dist < 160) {
      const look = ((event.clientX - cx) / 160) * 8;
      gsap.to(cat, { rotation: look, duration: 0.2, ease: 'sine.out', overwrite: 'auto' });
    } else {
      gsap.to(cat, { rotation: 0, duration: 0.35, ease: 'sine.out', overwrite: 'auto' });
    }
  };

  window.addEventListener('pointermove', onMove, { passive: true });

  return () => {
    window.removeEventListener('pointermove', onMove);
    clearTimeout(resumeTimer);
  };
}

/**
 * Scroll into view → one fast peek loop while section is near viewport.
 * Falls back to peek loop for consistency.
 */
export function animateScrollReveal(root, trigger, config = {}) {
  if (prefersReducedMotion()) {
    const { shown } = getPeekOffsets(config.direction || 'bottom');
    gsap.set(root, { ...shown, opacity: 0.8 });
    return () => {};
  }

  // Use the same fast peek language; start when section enters
  let stopPeek = null;
  const st = ScrollTrigger.create({
    trigger: trigger || root,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      stopPeek = animatePeekLoop(root, {
        direction: config.direction || 'bottom',
        peekDuration: config.peekDuration ?? 0.4,
        hideDuration: config.hideDuration ?? 0.35,
        visiblePause: config.visiblePause ?? [0.9, 1.5],
        hiddenPause: config.hiddenPause ?? [2.5, 4.5],
        startDelay: [0.15, 0.4],
      });
    },
  });

  return () => {
    st.kill();
    stopPeek?.();
  };
}

/** Tail-only flick loop (no full body needed) */
export function animateTailFlick(root, config = {}) {
  const direction = config.direction || 'right';
  const { hidden, shown } = getPeekOffsets(direction);

  if (prefersReducedMotion()) {
    gsap.set(root, { ...shown, opacity: 0.7 });
    return () => {};
  }

  gsap.set(root, { ...hidden, opacity: 1 });
  let killed = false;
  let delayCall;

  const cycle = () => {
    if (killed) return;
    const tl = gsap.timeline({
      onComplete: () => {
        if (!killed) {
          delayCall = gsap.delayedCall(randomBetween(config.hiddenPause ?? [2.2, 4.5]), cycle);
        }
      },
    });

    tl.to(root, {
      ...shown,
      duration: config.peekDuration ?? 0.32,
      ease: 'power2.out',
      onStart: () => flickTail(root),
    })
      .to({}, { duration: randomBetween(config.visiblePause ?? [0.5, 1.1]) })
      .to(root, {
        ...hidden,
        duration: config.hideDuration ?? 0.28,
        ease: 'power2.in',
      });
  };

  delayCall = gsap.delayedCall(randomBetween(config.startDelay ?? [1, 2.5]), cycle);

  return () => {
    killed = true;
    delayCall?.kill();
    gsap.killTweensOf(root);
  };
}

/** Peek when a related hover target is hovered */
export function animateHoverPeek(root, hoverTarget, config = {}) {
  if (!hoverTarget) return () => {};

  const direction = config.direction || 'bottom';
  const { hidden, shown } = getPeekOffsets(direction);

  if (prefersReducedMotion()) {
    gsap.set(root, { ...hidden, autoAlpha: 0 });
    return () => {};
  }

  gsap.set(root, { ...hidden, autoAlpha: 1 });

  const show = () => {
    gsap.to(root, {
      ...shown,
      duration: config.peekDuration ?? 0.4,
      ease: 'power2.out',
      onStart: () => flickTail(root),
    });
  };
  const hide = () => {
    gsap.to(root, { ...hidden, duration: config.hideDuration ?? 0.32, ease: 'power2.in' });
  };

  if (isFinePointer()) {
    hoverTarget.addEventListener('pointerenter', show);
    hoverTarget.addEventListener('pointerleave', hide);
  }

  return () => {
    hoverTarget.removeEventListener('pointerenter', show);
    hoverTarget.removeEventListener('pointerleave', hide);
  };
}
