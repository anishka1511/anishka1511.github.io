import { useEffect, useRef } from 'react';
import { CatDrawing } from './CatDrawing';
import { catConfig } from './catConfig';
import {
  animatePeekLoop,
  animateCursorReaction,
  animateScrollReveal,
  animateTailFlick,
  animateHoverPeek,
} from './catAnimations';

/**
 * Reusable decorative cat easter egg.
 * Pass `id` matching a key in catConfig, or override with props.
 */
function CatEasterEgg({
  id,
  type: typeProp,
  pose: poseProp,
  size: sizeProp,
  direction: directionProp,
  className = '',
  hoverSelector,
  triggerSelector,
}) {
  const rootRef = useRef(null);
  const hotspotRef = useRef(null);
  const config = id ? catConfig[id] : null;

  const type = typeProp || config?.type || 'peek';
  const pose = poseProp || config?.pose || 'peek';
  const size = sizeProp || config?.size || 48;
  const direction = directionProp || config?.direction || 'bottom';
  const mobileMode = config?.mobile || 'show';

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const resolvedConfig = { ...(config || {}), direction };
    const cleanups = [];

    if (type === 'peek') {
      cleanups.push(animatePeekLoop(root, resolvedConfig));
      if (config?.interactive) {
        cleanups.push(animateCursorReaction(root, hotspotRef.current, resolvedConfig));
      }
    }

    if (type === 'scrollReveal') {
      const trigger =
        (triggerSelector && document.querySelector(triggerSelector)) ||
        root.closest('section') ||
        root;
      cleanups.push(animateScrollReveal(root, trigger, resolvedConfig));
    }

    if (type === 'tailFlick') {
      cleanups.push(animateTailFlick(root, resolvedConfig));
    }

    if (type === 'hoverPeek') {
      const target =
        (hoverSelector && document.querySelector(hoverSelector)) ||
        root.closest('.work-card') ||
        root.parentElement;
      cleanups.push(animateHoverPeek(root, target, resolvedConfig));
    }

    return () => {
      cleanups.forEach((fn) => fn && fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- config keyed by id
  }, [id, type, direction, pose, hoverSelector, triggerSelector]);

  return (
    <div
      ref={rootRef}
      className={`cat-egg cat-egg--${type} cat-egg--from-${direction} cat-egg--mobile-${mobileMode} ${className}`.trim()}
      style={{ '--cat-size': `${size}px` }}
      aria-hidden="true"
      data-cat-direction={direction}
    >
      <div ref={hotspotRef} className="cat-egg-hotspot" />
      <div className="cat-egg-clip">
        <CatDrawing pose={pose} className="cat-drawing" />
      </div>
    </div>
  );
}

export default CatEasterEgg;
