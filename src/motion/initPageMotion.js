import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Global section reveals, card staggers, and stat count-ups.
 * Does not touch the hero name ScrollTrigger or letter hover system.
 */
export function initPageMotion() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) {
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      el.classList.add('is-visible');
    });
    document.querySelectorAll('.stat-pill[data-count]').forEach((pill) => {
      const valueEl = pill.querySelector('.stat-value');
      if (valueEl) valueEl.textContent = pill.getAttribute('data-count') || '0';
    });
    return () => {};
  }

  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 761px)', () => {
      setupReveals({ y: 32, stagger: 0.1, duration: 0.75 });
      setupWorkCards({ y: 36, stagger: 0.12 });
      setupParallaxDecor(1);
    });

    mm.add('(max-width: 760px)', () => {
      setupReveals({ y: 18, stagger: 0.06, duration: 0.55 });
      setupWorkCards({ y: 20, stagger: 0.07 });
      // No parallax on mobile
    });

    setupStatCounters();
  });

  ScrollTrigger.refresh();

  return () => ctx.revert();
}

function setupReveals({ y, stagger, duration }) {
  const sections = gsap.utils.toArray(
    '.about-section, .work-section, .experience-section, .github-section, .contact-section'
  );

  sections.forEach((section) => {
    const header = section.querySelector('.section-header-row, .experience-band .section-header-row');
    const label = section.querySelector('.section-label');
    const heading = section.querySelector('h2');

    if (label || heading || header) {
      const targets = [label, heading].filter(Boolean);
      if (targets.length) {
        gsap.from(targets, {
          opacity: 0,
          y: y * 0.7,
          duration,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true,
          },
        });
      }
    }

    const aboutBits = section.querySelectorAll(
      '.about-visual, .about-intro, .about-skills, .focus-item, .education-chip'
    );
    if (aboutBits.length) {
      gsap.from(aboutBits, {
        opacity: 0,
        y,
        duration,
        ease: 'power2.out',
        stagger: stagger * 0.7,
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          once: true,
        },
      });
    }

    const experienceItems = section.querySelectorAll(
      '.experience-item, .achievement-item, .stat-pill, .github-panel, .github-repo-card'
    );
    if (experienceItems.length) {
      gsap.from(experienceItems, {
        opacity: 0,
        y: y * 0.85,
        duration: duration * 0.9,
        ease: 'power2.out',
        stagger,
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          once: true,
        },
      });
    }

    const contactBits = section.querySelectorAll(
      '.contact-banner-copy, .contact-details, .contact-form'
    );
    if (contactBits.length) {
      gsap.from(contactBits, {
        opacity: 0,
        y: y * 0.8,
        duration,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: section,
          start: 'top 82%',
          once: true,
        },
      });
    }
  });
}

function setupWorkCards({ y, stagger }) {
  const section = document.querySelector('.work-section');
  if (!section) return;

  const cards = section.querySelectorAll('.work-card');
  if (!cards.length) return;

  gsap.from(cards, {
    opacity: 0,
    y,
    duration: 0.7,
    ease: 'power2.out',
    stagger,
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      once: true,
    },
  });

  cards.forEach((card) => {
    const mediaInner = card.querySelector('.work-card-media-inner');
    if (!mediaInner) return;

    gsap.from(mediaInner, {
      yPercent: 18,
      scale: 1.08,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true,
      },
    });
  });
}

function setupParallaxDecor(intensity) {
  const blob = document.querySelector('.hero-decor-blob');
  const peach = document.querySelector('.hero-decor-peach');
  const hero = document.querySelector('#hero');
  if (!hero) return;

  if (blob) {
    gsap.to(blob, {
      yPercent: 18 * intensity,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  if (peach) {
    gsap.to(peach, {
      yPercent: -12 * intensity,
      rotation: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }
}

function setupStatCounters() {
  const pills = document.querySelectorAll('.stat-pill[data-count]');
  pills.forEach((pill) => {
    const target = Number(pill.getAttribute('data-count'));
    const valueEl = pill.querySelector('.stat-value');
    if (!valueEl || Number.isNaN(target)) return;

    const counter = { value: 0 };

    ScrollTrigger.create({
      trigger: pill,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          value: target,
          duration: 0.9,
          ease: 'power2.out',
          onUpdate: () => {
            valueEl.textContent = String(Math.round(counter.value));
          },
        });
      },
    });
  });
}
