import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SQUARE_ORIGIN, setChapterDark } from './ThemeBridge';

gsap.registerPlugin(ScrollTrigger);

/** Same numbers as ThemeBridge enter */
const BASE_SIZE = 104;
const START_SCALE = 0.2;
const LIGHT_BG = '#faf4ee';

function easeProgress(p) {
  return p * p * (3 - 2 * p);
}

function getCoverScale(basePx = BASE_SIZE) {
  return (Math.max(window.innerWidth, window.innerHeight) / basePx) * 1.35;
}

/**
 * Mirror of Hero → Dark square, inverted:
 * dark stays put, cream square grows, Contact lives inside the square.
 */
function ContactBridge({ children }) {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const squareRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const square = squareRef.current;
    const content = contentRef.current;
    if (!wrap || !stage || !square || !content) return undefined;

    const section = content.querySelector('section');
    if (!section) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) {
      gsap.set([square, content], { clearProps: 'all' });
      const st = ScrollTrigger.create({
        trigger: wrap,
        start: 'top 70%',
        onEnter: () => setChapterDark(false),
        onLeaveBack: () => setChapterDark(true),
      });
      return () => st.kill();
    }

    const ox = `${SQUARE_ORIGIN.x}%`;
    const oy = `${SQUARE_ORIGIN.y}%`;

    // Cache once — live scrollHeight during scrub causes pin-distance jumps (glitches)
    const contactHeight = Math.max(section.scrollHeight, window.innerHeight);

    const applyScale = (s, scrollY = 0, opacity = 1) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const safe = Math.max(s, 0.001);
      const lx = BASE_SIZE / 2 - vw / (2 * safe);
      const ly = BASE_SIZE / 2 - vh / (2 * safe);

      gsap.set(square, {
        width: BASE_SIZE,
        height: BASE_SIZE,
        left: ox,
        top: oy,
        xPercent: -50,
        yPercent: -50,
        scale: safe,
        transformOrigin: '50% 50%',
        force3D: true,
      });

      gsap.set(content, {
        width: vw,
        x: lx,
        y: ly + scrollY / safe,
        scale: 1 / safe,
        transformOrigin: '0 0',
        opacity,
        force3D: true,
      });
    };

    applyScale(START_SCALE, 0, 0);
    setChapterDark(true);

    let wasDark = true;
    const syncNav = (wantDark) => {
      if (wantDark === wasDark) return;
      wasDark = wantDark;
      setChapterDark(wantDark);
    };

    const ctx = gsap.context(() => {
      // Fixed distance — same feel as enter (~1.7vh expand + contact overflow)
      const expandRun = () => window.innerHeight * 1.7;
      const innerScroll = () => Math.max(0, contactHeight - window.innerHeight);

      ScrollTrigger.create({
        // Pin when THIS page arrives — after the dark lead (not over GitHub)
        trigger: stage,
        start: 'top top',
        end: () => `+=${expandRun() + innerScroll()}`,
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const expandPortion = 0.55;
          const raw = self.progress;
          const cover = getCoverScale();

          if (raw <= expandPortion) {
            const p = easeProgress(raw / expandPortion);
            const s = gsap.utils.interpolate(START_SCALE, cover, p);
            const opacity = gsap.utils.clamp(0, 1, (p - 0.05) / 0.3);
            applyScale(s, 0, opacity);
            syncNav(p < 0.45);
          } else {
            const scrollP = (raw - expandPortion) / (1 - expandPortion);
            const maxY = Math.max(0, contactHeight - window.innerHeight);
            applyScale(cover, -maxY * scrollP, 1);
            syncNav(false);
          }
        },
        onLeave: () => syncNav(false),
        onEnterBack: () => syncNav(false),
        onLeaveBack: () => {
          applyScale(START_SCALE, 0, 0);
          syncNav(true);
        },
      });
    }, wrap);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);

    // After fonts/layout, one refresh — not on every github paint mid-scroll
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', onResize);
      ctx.revert();
    };
  }, []);

  return (
    <div className="theme-bridge theme-bridge--exit" ref={wrapRef}>
      {/* Full dark page after GitHub — square starts on the page after this */}
      <div className="contact-bridge-lead" aria-hidden="true" />

      <div className="theme-bridge-stage" ref={stageRef}>
        <div
          className="theme-bridge-square theme-bridge-square--exit"
          ref={squareRef}
          style={{ background: LIGHT_BG }}
        >
          <div className="theme-bridge-content" ref={contentRef}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactBridge;
