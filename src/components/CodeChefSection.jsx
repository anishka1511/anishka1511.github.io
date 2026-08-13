import ExternalLink from './ExternalLink';

function CodeChefSection({ username, profileUrl, problemsSolved }) {
  return (
    <section className="section codechef-section" id="codechef">
      <div className="section-header-row">
        <div>
          <p className="section-label">CodeChef</p>
          <h2>Competitive practice</h2>
        </div>
      </div>

      <div className="leetcode-compact">
        <div className="leetcode-compact-top">
          <p className="leetcode-handle">
            <ExternalLink href={profileUrl}>@{username}</ExternalLink>
          </p>
          <div className="leetcode-solved">
            <strong>{problemsSolved}</strong>
            <span>problems solved</span>
          </div>
        </div>
        <p className="codechef-cta">
          <ExternalLink className="btn btn-primary" href={profileUrl}>
            Open CodeChef
          </ExternalLink>
        </p>
      </div>
    </section>
  );
}

export default CodeChefSection;
