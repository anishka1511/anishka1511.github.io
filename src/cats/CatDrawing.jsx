/** Simple hand-drawn SVG cat poses — dark line art, easy to swap later */

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function CatPeek({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 70"
      width="80"
      height="70"
      aria-hidden="true"
      focusable="false"
    >
      <path {...stroke} d="M22 34 L18 12 L34 28" />
      <path {...stroke} d="M58 34 L62 12 L46 28" />
      <path {...stroke} d="M20 36 Q40 18 60 36 Q62 54 40 56 Q18 54 20 36 Z" />
      <circle cx="32" cy="40" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="48" cy="40" r="2.2" fill="currentColor" stroke="none" />
      <path {...stroke} strokeWidth="1.8" d="M40 44 L38 48 L42 48 Z" />
      <path {...stroke} strokeWidth="1.6" d="M40 48 Q34 52 30 50" />
      <path {...stroke} strokeWidth="1.6" d="M40 48 Q46 52 50 50" />
      <path {...stroke} strokeWidth="1.4" d="M18 42 H28 M18 46 H27" />
      <path {...stroke} strokeWidth="1.4" d="M62 42 H52 M62 46 H53" />
      {/* tiny hint of body/tail under head for peeks */}
      <path {...stroke} strokeWidth="1.8" className="cat-tail" d="M52 54 Q64 58 62 68" />
    </svg>
  );
}

/** Tail only — for flick peeks without a body */
export function CatTail({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 80"
      width="60"
      height="80"
      aria-hidden="true"
      focusable="false"
    >
      <path
        {...stroke}
        strokeWidth="2.4"
        className="cat-tail"
        d="M28 72 Q18 52 26 34 Q34 16 48 10"
      />
      <path
        {...stroke}
        strokeWidth="1.6"
        d="M48 10 Q52 8 50 14"
      />
    </svg>
  );
}

export function CatSit({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 90 100"
      width="90"
      height="100"
      aria-hidden="true"
      focusable="false"
    >
      <path {...stroke} d="M28 34 L24 14 L38 28" />
      <path {...stroke} d="M58 34 L62 14 L48 28" />
      <path {...stroke} d="M26 36 Q43 20 60 36 Q62 52 43 54 Q24 52 26 36 Z" />
      <circle cx="36" cy="40" r="2" fill="currentColor" stroke="none" />
      <circle cx="50" cy="40" r="2" fill="currentColor" stroke="none" />
      <path {...stroke} strokeWidth="1.6" d="M43 44 L41 47 L45 47 Z" />
      <path {...stroke} strokeWidth="1.5" d="M43 47 Q38 51 34 49 M43 47 Q48 51 52 49" />
      <path {...stroke} d="M30 54 Q22 78 34 88 Q43 94 52 88 Q66 78 56 54" />
      <path {...stroke} d="M34 88 Q36 80 40 88" />
      <path {...stroke} d="M48 88 Q50 80 54 88" />
      <path {...stroke} d="M56 70 Q78 62 74 42" className="cat-tail" />
    </svg>
  );
}

const poses = {
  peek: CatPeek,
  tail: CatTail,
  sit: CatSit,
};

export function CatDrawing({ pose = 'peek', className }) {
  const Pose = poses[pose] || CatPeek;
  return <Pose className={className} />;
}
