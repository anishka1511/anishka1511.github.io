import ExternalLink from './ExternalLink';

function GithubSection({
  loading,
  error,
  profile,
  repos,
  username,
  profileUrl,
}) {
  return (
    <section className="section github-section reveal-on-scroll" id="github">
      <div className="section-header-row">
        <div>
          <p className="section-label">GitHub</p>
          <h2>Open source activity</h2>
        </div>
      </div>

      {loading ? <p className="muted">Loading GitHub profile and repositories...</p> : null}
      {error ? <p className="muted">{error}</p> : null}

      {profile && !error ? (
        <div className="github-panel reveal-on-scroll">
          <div className="github-header">
            <img src={profile.avatar_url} alt="GitHub avatar" className="github-avatar" />
            <div>
              <h3>{profile.name || username}</h3>
              <p>@{profile.login}</p>
            </div>
          </div>
          <div className="github-stats">
            <div className="stat-item">
              <strong>{profile.public_repos}</strong>
              <span>Public Repos</span>
            </div>
            <div className="stat-item">
              <strong>{profile.followers}</strong>
              <span>Followers</span>
            </div>
            <div className="stat-item">
              <strong>{profile.following}</strong>
              <span>Following</span>
            </div>
          </div>
          <ExternalLink className="btn btn-primary" href={profileUrl}>
            Open GitHub Profile
          </ExternalLink>
        </div>
      ) : null}

      {repos.length ? (
        <div className="github-repos-grid">
          {repos.map((repo) => (
            <article className="github-repo-card reveal-on-scroll" key={repo.id}>
              <h3>{repo.name}</h3>
              <p className="muted">
                {repo.language || 'N/A'} · Updated {new Date(repo.updated_at).toLocaleDateString()}
              </p>
              <ExternalLink href={repo.html_url} className="work-card-link">
                View Repository →
              </ExternalLink>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default GithubSection;
