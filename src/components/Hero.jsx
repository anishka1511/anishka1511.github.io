import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  createHeroNameHover,
  splitNameToWords,
} from '../interactions/createHeroNameHover';

gsap.registerPlugin(ScrollTrigger);

function Hero({ name, title, intro, heroImage, location }) {
  const sectionRef = useRef(null);
  const nameRef = useRef(null);

  const nameWords = useMemo(() => splitNameToWords(name), [name]);

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
            { scale: 1, yPercent: 0, opacity: 1 },
            { scale: 1.1, yPercent: -6, opacity: 1, duration: 0.35 }
          ).to(nameEl, {
            scale: 0.68,
            yPercent: -42,
            opacity: 0.18,
            duration: 0.65,
          });
        } else {
          tl.fromTo(
            nameEl,
            { scale: 1, yPercent: 0, opacity: 1 },
            { scale: 1.04, yPercent: -4, opacity: 1, duration: 0.3 }
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
      <div className="hero-play-space" aria-hidden="true" data-future="cat-interactions" />

      <div className="hero-content">
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

      <div className="hero-visual">
        <div className="hero-portrait-glow" aria-hidden="true" />
        <div className="hero-portrait-frame">
          <img src={heroImage} alt={`${name} portrait`} className="hero-image" />
        </div>
        <div className="hero-play-space hero-play-space-side" aria-hidden="true" />
      </div>
    </section>
  );
}

export default Hero;
