import ExternalLink from './ExternalLink';

function SelectedWork({ projects }) {
  return (
    <section className="section work-section" id="projects">
      <div className="section-header-row">
        <div>
          <p className="section-label">Selected Work</p>
          <h2>Projects I&apos;ve built</h2>
        </div>
        <a className="section-link" href="#contact">
          Get in touch →
        </a>
      </div>

      <div className="work-grid">
        {projects.map((project, index) => {
          const category = project.subtitle.split(',')[0].trim();

          return (
            <article
              className={`work-card work-card-${(index % 3) + 1}`}
              key={project.title}
            >
              <div className="work-card-media" aria-hidden="true">
                <div className="work-card-media-inner">
                  <div className="work-card-texture" />
                  <span className="work-card-orb" />
                  <span className="work-card-initial">{project.title.charAt(0)}</span>
                </div>
              </div>
              <div className="work-card-body">
                <p className="work-card-category">{category}</p>
                <h3>{project.title}</h3>
                <p className="work-card-desc">{project.description}</p>
                <p className="work-card-stack">{project.techStack}</p>
                <div className="work-card-footer">
                  <ExternalLink href={project.github} className="work-card-link">
                    View on GitHub
                  </ExternalLink>
                  <span className="work-card-arrow" aria-hidden="true">
                    →
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default SelectedWork;
