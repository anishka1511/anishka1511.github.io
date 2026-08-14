import gsap from 'gsap';

/**
 * Letter-level magnetic hover for hero typography.
 * Applies temporary local transforms only — does not touch scroll-controlled parents.
 */
export function createHeroNameHover({
  root,
  letters,
  intensity = 1,
  radius = 130,
  maxOffset = 14,
  maxRotate = 7,
  maxScale = 0.07,
}) {
  if (!root || !letters?.length) {
    return { destroy() {} };
  }

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = window.matchMedia('(min-width: 761px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const canInteract = () =>
    finePointer.matches && desktop.matches && !reduceMotion.matches;

  const letterState = letters.map((el) => ({
    el,
    cx: 0,
    cy: 0,
    x: 0,
    y: 0,
    r: 0,
    s: 1,
    tint: 0,
    tx: 0,
    ty: 0,
    tr: 0,
    ts: 1,
    tt: 0,
    setX: gsap.quickSetter(el, 'x', 'px'),
    setY: gsap.quickSetter(el, 'y', 'px'),
    setR: gsap.quickSetter(el, 'rotation', 'deg'),
    setS: gsap.quickSetter(el, 'scale'),
  }));

  const pointer = { x: 0, y: 0, sx: 0, sy: 0, active: false, inside: false };
  let follower = null;
  let running = false;
  let measurePending = false;

  function ensureFollower() {
    if (follower || !root) return;
    follower = document.createElement('span');
    follower.className = 'hero-name-cursor';
    follower.setAttribute('aria-hidden', 'true');
    root.appendChild(follower);
  }

  function removeFollower() {
    if (follower?.parentNode) follower.parentNode.removeChild(follower);
    follower = null;
  }

  function measure() {
    letterState.forEach((item) => {
      const rect = item.el.getBoundingClientRect();
      item.cx = rect.left + rect.width / 2;
      item.cy = rect.top + rect.height / 2;
    });
  }

  function scheduleMeasure() {
    if (measurePending) return;
    measurePending = true;
    requestAnimationFrame(() => {
      measurePending = false;
      if (pointer.inside || pointer.active) measure();
    });
  }

  function setTargetsFromPointer() {
    const influence = radius * intensity;
    const push = maxOffset * intensity;

    letterState.forEach((item) => {
      const dx = item.cx - pointer.sx;
      const dy = item.cy - pointer.sy;
      const dist = Math.hypot(dx, dy);
      const falloff = Math.max(0, 1 - dist / influence);
      const strength = falloff * falloff;

      if (strength <= 0.001) {
        item.tx = 0;
        item.ty = 0;
        item.tr = 0;
        item.ts = 1;
        item.tt = 0;
        return;
      }

      const nx = dist > 0.001 ? dx / dist : 0;
      const ny = dist > 0.001 ? dy / dist : 0;

      // Gentle repulsion: letters yield away from the cursor
      item.tx = nx * strength * push;
      item.ty = ny * strength * push * 0.85;
      item.tr = -nx * strength * maxRotate * intensity;
      item.ts = 1 + strength * maxScale * intensity;
      item.tt = strength;
    });
  }

  function clearTargets() {
    letterState.forEach((item) => {
      item.tx = 0;
      item.ty = 0;
      item.tr = 0;
      item.ts = 1;
      item.tt = 0;
    });
  }

  function settleComplete() {
    return letterState.every(
      (item) =>
        Math.abs(item.x) < 0.05 &&
        Math.abs(item.y) < 0.05 &&
        Math.abs(item.r) < 0.05 &&
        Math.abs(item.s - 1) < 0.001 &&
        Math.abs(item.tint) < 0.01
    );
  }

  function applyVisual(item) {
    item.setX(item.x);
    item.setY(item.y);
    item.setR(item.r);
    item.setS(item.s);
    const mix = item.tint;
    if (mix > 0.02) {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      if (isDark) {
        // Cream ink → coral (same hover feel, dark palette preserved)
        item.el.style.color = `rgb(${Math.round(246 + (233 - 246) * mix * 0.85)}, ${Math.round(239 + (132 - 239) * mix)}, ${Math.round(232 + (106 - 232) * mix)})`;
      } else {
        const coral = 233;
        const g = Math.round(132 + (196 - 132) * mix);
        const b = Math.round(106 + (200 - 106) * mix);
        item.el.style.color = `rgb(${Math.round(47 + (coral - 47) * mix * 0.85)}, ${Math.round(41 + (g - 41) * mix)}, ${Math.round(37 + (b - 37) * mix)})`;
      }
    } else {
      item.el.style.color = '';
    }
  }

  function tick() {
    if (!canInteract()) {
      clearTargets();
      pointer.active = false;
    }

    const pointerLerp = pointer.inside ? 0.22 : 0.14;
    pointer.sx += (pointer.x - pointer.sx) * pointerLerp;
    pointer.sy += (pointer.y - pointer.sy) * pointerLerp;

    if (pointer.inside) {
      setTargetsFromPointer();
    } else {
      clearTargets();
    }

    // Springier settle when leaving; snappier while tracking
    const follow = pointer.inside ? 0.18 : 0.12;

    letterState.forEach((item) => {
      item.x += (item.tx - item.x) * follow;
      item.y += (item.ty - item.y) * follow;
      item.r += (item.tr - item.r) * follow;
      item.s += (item.ts - item.s) * follow;
      item.tint += (item.tt - item.tint) * follow;
      applyVisual(item);
    });

    if (follower) {
      const rect = root.getBoundingClientRect();
      const fx = pointer.sx - rect.left;
      const fy = pointer.sy - rect.top;
      const show = pointer.inside ? 1 : 0;
      follower.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%)`;
      follower.style.opacity = String(show * 0.9);
    }

    if (!pointer.inside && settleComplete()) {
      running = false;
      gsap.ticker.remove(tick);
      removeFollower();
      letterState.forEach((item) => {
        item.el.style.color = '';
        gsap.set(item.el, { x: 0, y: 0, rotation: 0, scale: 1 });
      });
    }
  }

  function startTicker() {
    if (running) return;
    running = true;
    gsap.ticker.add(tick);
  }

  function onPointerEnter(event) {
    if (!canInteract()) return;
    ensureFollower();
    pointer.inside = true;
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.sx = event.clientX;
    pointer.sy = event.clientY;
    measure();
    root.classList.add('is-name-hovering');
    startTicker();
  }

  function onPointerMove(event) {
    if (!canInteract() || !pointer.inside) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  function onPointerLeave() {
    pointer.inside = false;
    root.classList.remove('is-name-hovering');
    startTicker();
  }

  function onResize() {
    if (pointer.inside) scheduleMeasure();
  }

  root.addEventListener('pointerenter', onPointerEnter);
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', scheduleMeasure, { passive: true });

  return {
    destroy() {
      root.removeEventListener('pointerenter', onPointerEnter);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', scheduleMeasure);
      gsap.ticker.remove(tick);
      running = false;
      root.classList.remove('is-name-hovering');
      removeFollower();
      letterState.forEach((item) => {
        item.el.style.color = '';
        gsap.set(item.el, { clearProps: 'transform,color' });
      });
    },
  };
}

export function splitNameToWords(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, wordIndex) => ({
      key: `word-${wordIndex}-${word}`,
      chars: Array.from(word).map((char, charIndex) => ({
        char,
        key: `char-${wordIndex}-${charIndex}-${char}`,
      })),
    }));
}

/** @deprecated use splitNameToWords */
export function splitNameToChars(name) {
  const parts = [];
  const characters = Array.from(name);

  characters.forEach((char, index) => {
    if (char === ' ') {
      parts.push({ type: 'space', key: `space-${index}` });
      return;
    }
    parts.push({ type: 'char', char, key: `char-${index}-${char}` });
  });

  return parts;
}
