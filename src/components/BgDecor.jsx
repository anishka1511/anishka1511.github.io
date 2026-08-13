/**
 * Decorative motifs: soft blobs, squiggles, sparkles.
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

      <svg className="bg-decor-star bg-decor-star--a" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 2 L22.8 15.2 L36 18 L22.8 20.8 L20 34 L17.2 20.8 L4 18 L17.2 15.2 Z"
          fill={PINK}
          opacity="0.8"
        />
      </svg>

      <svg className="bg-decor-star bg-decor-star--b" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 4 L22 16 L34 18 L22 20 L20 32 L18 20 L6 18 L18 16 Z"
          fill={CREAM}
          opacity="0.9"
        />
      </svg>

      <svg className="bg-decor-star bg-decor-star--c" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 2 L22.5 14.5 L35 17 L22.5 19.5 L20 32 L17.5 19.5 L5 17 L17.5 14.5 Z"
          fill={PINK_SOFT}
          opacity="0.85"
        />
      </svg>

      <svg className="bg-decor-star bg-decor-star--d" viewBox="0 0 40 40" fill="none">
        <path
          d="M20 3 L22.2 15 L34 17 L22.2 19 L20 31 L17.8 19 L6 17 L17.8 15 Z"
          fill={CREAM}
          opacity="0.85"
        />
      </svg>
    </div>
  );
}

export default BgDecor;
