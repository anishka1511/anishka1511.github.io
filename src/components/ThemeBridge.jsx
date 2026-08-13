import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Expansion origin as % of the pinned stage — change to retarget. */
export const SQUARE_ORIGIN = { x: 50, y: 50 };

const BASE_SIZE = 104;

function easeProgress(p) {
  return p * p * (3 - 2 * p);
}

function getCoverScale(basePx = BASE_SIZE) {
  // Cover full viewport on any aspect ratio (square may extend past edges).
  return (Math.max(window.innerWidth, window.innerHeight) / basePx) * 1.35;
}

/**
 * Light hero → expanding dark square (transform scale) → dark About.
 * Scrubbed, pinned, reversible. Theme via DOM class — not React scroll state.
 */
function ThemeBridge({ children }) {
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

    const section = content.querySelector('.about-section');
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const setChapterDark = (on) => {
      root.classList.toggle('chapter-dark', Boolean(on));
    };

    if (reduce.matches) {
      gsap.set([square, content], { clearProps: 'all' });
      const st = ScrollTrigger.create({
        trigger: wrap,
        start: 'top 72%',
        end: 'bottom 35%',
        onEnter: () => setChapterDark(true),
        onLeave: () => setChapterDark(false),
        onEnterBack: () => setChapterDark(true),
        onLeaveBack: () => setChapterDark(false),
      });
      return () => {
        st.kill();
        setChapterDark(false);
      };
    }

    const ox = `${SQUARE_ORIGIN.x}%`;
    const oy = `${SQUARE_ORIGIN.y}%`;

    const applyScale = (s, scrollY = 0, opacity = 1) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Map content (0,0) to viewport (0,0) through the scaled square
      const lx = BASE_SIZE / 2 - vw / (2 * s);
      const ly = BASE_SIZE / 2 - vh / (2 * s);

      gsap.set(square, {
        width: BASE_SIZE,
        height: BASE_SIZE,
        left: ox,
        top: oy,
        xPercent: -50,
        yPercent: -50,
        scale: s,
        transformOrigin: '50% 50%',
        force3D: true,
      });

      gsap.set(content, {
        width: vw,
        x: lx,
        y: ly + scrollY / s,
        scale: 1 / s,
        transformOrigin: '0 0',
        opacity,
        force3D: true,
      });
    };

    applyScale(0.12, 0, 0);

    const ctx = gsap.context(() => {
      const getEnd = () => {
        const expandRun = window.innerHeight * 1.7;
        const aboutH = section ? section.scrollHeight : content.scrollHeight;
        const innerScroll = Math.max(0, aboutH - window.innerHeight);
        return expandRun + innerScroll;
      };

      ScrollTrigger.create({
        trigger: wrap,
        start: 'top top',
        end: getEnd,
        pin: stage,
        scrub: 0.65,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const expandPortion = 0.55;
          const raw = self.progress;
          const cover = getCoverScale();

          if (raw <= expandPortion) {
            const p = easeProgress(raw / expandPortion);
            const s = gsap.utils.interpolate(0.12, cover, p);
            const opacity = gsap.utils.clamp(0, 1, (p - 0.06) / 0.32);
            applyScale(s, 0, opacity);
            setChapterDark(p > 0.45);
          } else {
            const scrollP = (raw - expandPortion) / (1 - expandPortion);
            const aboutH = section ? section.scrollHeight : content.scrollHeight;
            const maxY = Math.max(0, aboutH - window.innerHeight);
            applyScale(cover, -maxY * scrollP, 1);
            setChapterDark(true);
          }
        },
        onLeave: () => setChapterDark(false),
        onEnterBack: () => setChapterDark(true),
        onLeaveBack: () => {
          applyScale(0.12, 0, 0);
          setChapterDark(false);
        },
      });
    }, wrap);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      ctx.revert();
      setChapterDark(false);
    };
  }, []);

  return (
    <div className="theme-bridge" ref={wrapRef}>
      <div className="theme-bridge-stage" ref={stageRef}>
        <div className="theme-bridge-square" ref={squareRef}>
          <div className="theme-bridge-content" ref={contentRef}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeBridge;
