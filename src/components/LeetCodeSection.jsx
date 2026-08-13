import { useEffect, useMemo, useState } from 'react';
import ExternalLink from './ExternalLink';

const STATS_URL = (username) =>
  `https://leetcode-stats.tashif.codes/${encodeURIComponent(username)}`;

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS = 53;

function buildHeatmapDays(submissionCalendar) {
  const counts = submissionCalendar || {};
  const values = Object.values(counts).map(Number).filter((n) => n > 0);
  const max = values.length ? Math.max(...values) : 1;

  const now = new Date();
  const endUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  // Start on a Sunday (UTC), ~WEEKS weeks back
  let startUtc = endUtc - (WEEKS * 7 - 1) * DAY_MS;
  startUtc -= new Date(startUtc).getUTCDay() * DAY_MS;

  const days = [];
  for (let t = startUtc; t <= endUtc; t += DAY_MS) {
    const unix = Math.floor(t / 1000);
    const count = Number(counts[String(unix)] || 0);
    const d = new Date(t);
    const label = d.toLocaleDateString(undefined, { timeZone: 'UTC' });

    let level = 0;
    if (count > 0) {
      const tNorm = count / max;
      if (tNorm <= 0.25) level = 1;
      else if (tNorm <= 0.5) level = 2;
      else if (tNorm <= 0.75) level = 3;
      else level = 4;
    }

    days.push({
      key: `${unix}`,
      count,
      level,
      title: `${label}: ${count} submission${count === 1 ? '' : 's'}`,
    });
  }
  return days;
}

function LeetCodeSection({ username, profileUrl }) {
  const [totalSolved, setTotalSolved] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(STATS_URL(username));
        if (!res.ok) throw new Error('Failed to load LeetCode stats');
        const data = await res.json();
        if (cancelled) return;
        if (data.status && data.status !== 'success') {
          throw new Error(data.message || 'LeetCode stats unavailable');
        }
        setTotalSolved(typeof data.totalSolved === 'number' ? data.totalSolved : null);
        setCalendar(data.submissionCalendar || {});
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load LeetCode data');
          setTotalSolved(null);
          setCalendar(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const days = useMemo(
    () => (calendar ? buildHeatmapDays(calendar) : []),
    [calendar]
  );

  return (
    <section className="section leetcode-section" id="leetcode">
      <div className="section-header-row">
        <div>
          <p className="section-label">LeetCode</p>
          <h2>Problem solving</h2>
        </div>
      </div>

      <div className="leetcode-compact">
        <div className="leetcode-compact-top">
          <p className="leetcode-handle">
            <ExternalLink href={profileUrl}>@{username}</ExternalLink>
          </p>
          <div className="leetcode-solved" aria-live="polite">
            {loading ? (
              <span className="muted">…</span>
            ) : totalSolved != null ? (
              <>
                <strong>{totalSolved}</strong>
                <span>problems solved</span>
              </>
            ) : (
              <span className="muted">—</span>
            )}
          </div>
        </div>

        {error ? (
          <p className="muted leetcode-fallback">
            {error}. <ExternalLink href={profileUrl}>Open profile</ExternalLink>
          </p>
        ) : loading ? (
          <p className="muted leetcode-fallback">Loading heatmap…</p>
        ) : (
          <div className="leetcode-heatmap" role="img" aria-label="LeetCode submission heatmap">
            <div className="leetcode-heatmap-grid">
              {days.map((day) => (
                <span
                  key={day.key}
                  className={`leetcode-day leetcode-day--l${day.level}`}
                  title={day.title}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default LeetCodeSection;
