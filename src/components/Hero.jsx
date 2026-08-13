import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  createHeroNameHover,
  splitNameToWords,
} from '../interactions/createHeroNameHover';
import CatEasterEgg from '../cats/CatEasterEgg';

gsap.registerPlugin(ScrollTrigger);

function Hero({ name, title, intro, heroImage, location }) {
  const sectionRef = useRef(null);
  const nameRef = useRef(null);
  const contentRef = useRef(null);
  const visualRef = useRef(null);

  const nameWords = useMemo(() => splitNameToWords(name), [name]);

  // Stage 3: scroll-scrubbed name transform (preserved)
  useEffect(() => {
    const section = sectionRef.current;
    const nameEl = nameRef.current;
    if (!section || !nameEl) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return undefined;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 761px)',
        isMobile: '(max-width: 760px)',
      },
      (context) => {
        const { isDesktop } = context.conditions;

        gsap.set(nameEl, {
          transformOrigin: isDesktop ? 'left center' : 'center center',
          force3D: true,
        });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: isDesktop ? 0.7 : 0.45,
            invalidateOnRefresh: true,
          },
        });

        if (isDesktop) {
          tl.fromTo(
            nameEl,
            { scale: 1, yPercent: 0 },
            { scale: 1.1, yPercent: -6, duration: 0.35 }
          ).to(nameEl, {
            scale: 0.68,
            yPercent: -42,
            opacity: 0.18,
            duration: 0.65,
          });
        } else {
          tl.fromTo(
            nameEl,
            { scale: 1, yPercent: 0 },
            { scale: 1.04, yPercent: -4, duration: 0.3 }
          ).to(nameEl, {
            scale: 0.86,
            yPercent: -22,
            opacity: 0.28,
            duration: 0.7,
          });
        }

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      }
    );

    const onMotionChange = (event) => {
      if (event.matches) {
        mm.revert();
        gsap.set(nameEl, { clearProps: 'transform,opacity' });
      }
    };

    motionQuery.addEventListener?.('change', onMotionChange);

    return () => {
      motionQuery.removeEventListener?.('change', onMotionChange);
      mm.revert();
    };
  }, []);

  // Supporting hero content fades with scroll (does not drive the name)
  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const visual = visualRef.current;
    if (!section || !content) return undefined;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return undefined;

    const support = content.querySelectorAll(
      '.eyebrow, .hero-role, .hero-subtitle, .hero-location, .hero-actions'
    );

    const ctx = gsap.context(() => {
      gsap.to(support, {
        opacity: 0,
        y: -28,
        ease: 'none',
        stagger: 0.02,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'center top',
          scrub: true,
        },
      });

      if (visual) {
        gsap.to(visual, {
          opacity: 0.25,
          y: -40,
          scale: 0.94,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  // Hero entrance
  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const visual = visualRef.current;
    const nameEl = nameRef.current;
    if (!section || !content) return undefined;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return undefined;

    const eyebrow = content.querySelector('.eyebrow');
    const role = content.querySelector('.hero-role');
    const subtitle = content.querySelector('.hero-subtitle');
    const locationEl = content.querySelector('.hero-location');
    const actions = content.querySelector('.hero-actions');
    const decor = section.querySelectorAll('.hero-decor');

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      gsap.set([eyebrow, nameEl, role, subtitle, locationEl, actions, visual, decor], {
        opacity: 0,
      });
      gsap.set([eyebrow, role, subtitle, locationEl, actions], { y: 18 });
      // Name transform is owned by Stage 3 ScrollTrigger — entrance only fades it in
      if (visual) gsap.set(visual, { y: 24, scale: 0.96 });
      gsap.set(decor, { scale: 0.92 });

      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.45 }, 0.08)
        .to(nameEl, { opacity: 1, duration: 0.65 }, 0.16)
        .to(role, { opacity: 1, y: 0, duration: 0.5 }, 0.32)
        .to([subtitle, locationEl], { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 }, 0.4)
        .to(actions, { opacity: 1, y: 0, duration: 0.45 }, 0.52)
        .to(visual, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, 0.22)
        .to(decor, { opacity: 1, scale: 1, duration: 0.8, stagger: 0.05 }, 0.18);
    }, section);

    return () => ctx.revert();
  }, []);

  // Letter hover (Stage 4)
  useEffect(() => {
    const nameEl = nameRef.current;
    if (!nameEl) return undefined;

    const letters = Array.from(nameEl.querySelectorAll('.hero-name-char'));
    if (!letters.length) return undefined;

    const hover = createHeroNameHover({
      root: nameEl,
      letters,
      intensity: 1,
    });

    return () => hover.destroy();
  }, [nameWords]);

  return (
    <section className="hero section" id="hero" ref={sectionRef}>
      <div className="hero-decor hero-decor-blob" aria-hidden="true" />
      <div className="hero-decor hero-decor-peach" aria-hidden="true" />
      <div className="hero-decor hero-decor-squiggle" aria-hidden="true" />

      <div className="hero-content" ref={contentRef}>
        <p className="eyebrow">Hello, I am</p>
        <h1 className="hero-name" ref={nameRef} aria-label={name} data-future="name-animation">
          <span className="hero-name-letters" aria-hidden="true">
            {nameWords.map((word) => (
              <span className="hero-name-word" key={word.key}>
                {word.chars.map((item) => (
                  <span className="hero-name-char" key={item.key}>
                    {item.char}
                  </span>
                ))}
              </span>
            ))}
          </span>
        </h1>
        <p className="hero-role">{title}</p>
        <p className="hero-subtitle">{intro}</p>
        <p className="hero-location">{location}</p>

        <div className="hero-actions">
          <a className="btn btn-primary" href="#projects">
            View My Work <span aria-hidden="true">→</span>
          </a>
          <a className="btn btn-ghost" href="#about">
            About Me <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      <div className="hero-visual" ref={visualRef}>
        <div className="hero-portrait-glow" aria-hidden="true" />
        <div className="hero-portrait-frame">
          <img src={heroImage} alt={`${name} portrait`} className="hero-image" />
        </div>
        <div className="hero-cat-slot" aria-hidden="true">
          <CatEasterEgg id="heroPeek" className="cat-hero-peek" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
