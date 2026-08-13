import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Expansion origin as % of the pinned stage — change to retarget. */
export const SQUARE_ORIGIN = { x: 50, y: 50 };

const BASE_SIZE = 104;
const START_SCALE = 0.2;
const LIGHT_BG = '#faf4ee';

function easeProgress(p) {
  return p * p * (3 - 2 * p);
}

function getCoverScale(basePx = BASE_SIZE) {
  return (Math.max(window.innerWidth, window.innerHeight) / basePx) * 1.35;
}

export function setChapterDark(on) {
  document.documentElement.classList.toggle('chapter-dark', Boolean(on));
}

/**
 * Enter: square expands with About inside → chapter (pink–orange in light, charcoal in dark).
 * Exit: light square expands with Contact inside.
 * Same scrub/pin/scale system both ways. No empty kicker.
 */
function ThemeBridge({ mode = 'enter', children }) {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const squareRef = useRef(null);
  const contentRef = useRef(null);
  const isExit = mode === 'exit';

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

      if (isExit) {
        const st = ScrollTrigger.create({
          trigger: wrap,
          start: 'top 70%',
          end: 'bottom 40%',
          onEnter: () => setChapterDark(false),
          onLeaveBack: () => setChapterDark(true),
        });
        return () => st.kill();
      }

      const chapter = document.querySelector('.dark-chapter');
      const st = ScrollTrigger.create({
        trigger: wrap,
        start: 'top 75%',
        end: () => (chapter ? 'bottom bottom' : 'bottom 25%'),
        endTrigger: chapter || wrap,
        onEnter: () => setChapterDark(true),
        onLeaveBack: () => setChapterDark(false),
        onEnterBack: () => setChapterDark(true),
      });
      return () => st.kill();
    }

    const ox = `${SQUARE_ORIGIN.x}%`;
    const oy = `${SQUARE_ORIGIN.y}%`;

    const applyScale = (s, scrollY = 0, opacity = 1) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
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

    applyScale(START_SCALE, 0, 0);

    const ctx = gsap.context(() => {
      const getEnd = () => {
        const expandRun = window.innerHeight * 1.7;
        const h = section.scrollHeight;
        const innerScroll = Math.max(0, h - window.innerHeight);
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
            const s = gsap.utils.interpolate(START_SCALE, cover, p);
            const opacity = gsap.utils.clamp(0, 1, (p - 0.05) / 0.3);
            applyScale(s, 0, opacity);

            if (isExit) {
              setChapterDark(p < 0.48);
            } else {
              setChapterDark(p > 0.45);
            }
          } else {
            const scrollP = (raw - expandPortion) / (1 - expandPortion);
            const h = section.scrollHeight;
            const maxY = Math.max(0, h - window.innerHeight);
            applyScale(cover, -maxY * scrollP, 1);
            setChapterDark(!isExit);
          }
        },
        onLeave: () => setChapterDark(!isExit),
        onEnterBack: () => setChapterDark(!isExit),
        onLeaveBack: () => {
          applyScale(START_SCALE, 0, 0);
          setChapterDark(isExit);
        },
      });
    }, wrap);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      ctx.revert();
    };
  }, [isExit]);

  useEffect(() => {
    if (isExit) return undefined;

    const chapter = document.querySelector('.dark-chapter');
    if (!chapter) return undefined;

    const lock = ScrollTrigger.create({
      trigger: chapter,
      start: 'top 90%',
      // Release before Contact bridge so exit theme isn't fighting this lock
      end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive) setChapterDark(true);
      },
    });

    return () => lock.kill();
  }, [isExit]);

  return (
    <div className={`theme-bridge theme-bridge--${mode}`} ref={wrapRef}>
      <div className="theme-bridge-stage" ref={stageRef}>
        <div
          className={`theme-bridge-square theme-bridge-square--${mode}`}
          ref={squareRef}
          style={isExit ? { background: LIGHT_BG } : undefined}
        >
          <div className="theme-bridge-content" ref={contentRef}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeBridge;
