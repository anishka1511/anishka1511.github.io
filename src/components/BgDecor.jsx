/**
 * Decorative motifs: soft blobs and squiggles (no stars).
 */

const PINK = '#ff78a7';
const PINK_SOFT = '#ff8fb5';
const CREAM = '#fff8f4';

function BgDecor({ variant = 'chapter' }) {
  return (
    <div className={`bg-decor bg-decor--${variant}`} aria-hidden="true">
      <span className="bg-decor-blob bg-decor-blob--pink" />
      <span className="bg-decor-blob bg-decor-blob--peach" />
      <span className="bg-decor-blob bg-decor-blob--beige" />

      {variant !== 'hero' ? (
        <>
          <svg className="bg-decor-squiggle bg-decor-squiggle--a" viewBox="0 0 120 36" fill="none">
            <path
              d="M4 22 C 18 4, 32 30, 48 16 S 78 6, 96 22 S 112 28, 116 14"
              stroke={PINK}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
          </svg>

          <svg className="bg-decor-squiggle bg-decor-squiggle--b" viewBox="0 0 100 32" fill="none">
            <path
              d="M6 18 C 20 6, 34 26, 50 12 S 78 8, 94 20"
              stroke={PINK_SOFT}
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
          </svg>

          <svg className="bg-decor-squiggle bg-decor-squiggle--c" viewBox="0 0 90 28" fill="none">
            <path
              d="M4 16 C 16 4, 28 24, 44 10 S 72 6, 86 18"
              stroke={CREAM}
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />
          </svg>
        </>
      ) : null}
    </div>
  );
}

export default BgDecor;
