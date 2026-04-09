import { useEffect, useMemo, useState } from 'react';
import { portfolioData } from './portfolioData';

const THEME_STORAGE_KEY = 'portfolio-theme';

const navItems = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'github', label: 'GitHub' },
  { id: 'contact', label: 'Contact' },
];

function getGithubUsername(githubUrl) {
  const match = githubUrl.match(/github\.com\/([^/]+)/i);
  return match?.[1] ?? '';
}

function SectionHeading({ number, title }) {
  return (
    <div className="section-heading">
      <span className="section-kicker">{String(number).padStart(2, '0')}</span>
      <h2>{title}</h2>
    </div>
  );
}

function ExternalLink({ href, className, children }) {
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function HeroIntro({ intro, objective }) {
  return (
    <>
      <p className="intro">{intro}</p>
      <p className="intro" style={{ marginTop: '0.55rem' }}>
        {objective}
      </p>
    </>
  );
}

function App() {
  const {
    siteName,
    name,
    title,
    heroImage,
    about,
    careerObjective,
    education,
    location,
    phone,
    links,
    social,
    skills,
    projects,
    experience,
    achievements,
  } = portfolioData;

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProjectFilter, setActiveProjectFilter] = useState('All');
  const [showAllExperience, setShowAllExperience] = useState(false);
  const [githubProfile, setGithubProfile] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubLoading, setGithubLoading] = useState(true);
  const [githubError, setGithubError] = useState('');
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const isDarkTheme = theme === 'dark';

  const handleLinkClick = () => setMenuOpen(false);
  const handleMenuToggle = () => setMenuOpen((prev) => !prev);
  const handleThemeToggle = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const handleSubmit = (event) => {
    event.preventDefault();
    window.alert('Thank you. Your message has been noted.');
    event.target.reset();
  };

  const projectFilters = useMemo(() => {
    const derived = projects.map((project) => project.subtitle.split(',')[0].trim());
    return ['All', ...new Set(derived)];
  }, [projects]);

  const visibleProjects = useMemo(() => {
    if (activeProjectFilter === 'All') return projects;
    return projects.filter((project) => project.subtitle.startsWith(activeProjectFilter));
  }, [activeProjectFilter, projects]);

  const visibleExperience = showAllExperience ? experience : experience.slice(0, 2);
  const githubUsername = useMemo(() => getGithubUsername(links.github), [links.github]);

  useEffect(() => {
    if (!githubUsername) {
      setGithubLoading(false);
      setGithubError('GitHub username is missing.');
      return;
    }

    const controller = new AbortController();

    async function loadGithubData() {
      setGithubLoading(true);
      setGithubError('');

      try {
        const [profileRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${githubUsername}`, {
            signal: controller.signal,
            headers: { Accept: 'application/vnd.github+json' },
          }),
          fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`, {
            signal: controller.signal,
            headers: { Accept: 'application/vnd.github+json' },
          }),
        ]);

        if (!profileRes.ok || !reposRes.ok) {
          throw new Error('Could not fetch GitHub data right now.');
        }

        const profileData = await profileRes.json();
        const reposData = await reposRes.json();

        setGithubProfile(profileData);
        setGithubRepos(Array.isArray(reposData) ? reposData : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setGithubError('Unable to load GitHub data at the moment.');
        }
      } finally {
        setGithubLoading(false);
      }
    }

    loadGithubData();

    return () => controller.abort();
  }, [githubUsername]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.14 }
    );

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [visibleProjects, visibleExperience, githubLoading]);

  return (
    <div className="page-wrap">
      <div className="page-shell">
        <header className="site-header">
          <a href="#hero" className="logo">
            {siteName}
          </a>
          <div className="header-actions">
            <button
              className="theme-toggle"
              type="button"
              aria-label="Toggle dark mode"
              onClick={handleThemeToggle}
            >
              {isDarkTheme ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              className="menu-toggle"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={handleMenuToggle}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          <nav className={`site-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={handleLinkClick}>
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <main>
          <section className="hero section reveal-on-scroll" id="hero">
            <div className="hero-content">
              <p className="eyebrow">Hello, I am</p>
              <h1>{name}</h1>
              <p className="title">{title}</p>
              <div className="hero-meta">
                <span className="meta-pill">{location}</span>
                <span className="meta-pill">{education.degree}</span>
                <span className="meta-pill">CGPA {education.cgpa}</span>
              </div>
              <HeroIntro intro={portfolioData.intro} objective={careerObjective} />
              <div className="hero-actions">
                <ExternalLink className="btn btn-primary" href={links.github}>
                  View GitHub
                </ExternalLink>
                <ExternalLink className="btn btn-secondary" href={links.linkedin}>
                  View {social.linkedinLabel}
                </ExternalLink>
              </div>
            </div>
            <div className="hero-image-wrap">
              <img src={heroImage} alt="Portfolio portrait" className="hero-image" />
            </div>
          </section>

          <section className="section reveal-on-scroll" id="about">
            <SectionHeading number={1} title="About" />
            <p className="section-copy">{about}</p>
            <div className="projects-grid" style={{ marginTop: '1rem' }}>
              <article className="project-card reveal-on-scroll">
                <h3>Career Objective</h3>
                <p>{careerObjective}</p>
              </article>
              <article className="project-card reveal-on-scroll">
                <h3>Education</h3>
                <p>{education.institution}</p>
                <p>{education.location}</p>
                <p>{education.degree}</p>
                <p>
                  <strong>CGPA:</strong> {education.cgpa}
                </p>
              </article>
            </div>
          </section>

          <section className="section reveal-on-scroll" id="skills">
            <SectionHeading number={2} title="Skills" />
            <div className="skills-grid">
              {skills.map((group) => (
                <article className="skill-card reveal-on-scroll" key={group.title}>
                  <h3>{group.title}</h3>
                  <div className="tag-list">
                    {group.items.map((item) => (
                      <span className="tag" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="section reveal-on-scroll" id="projects">
            <SectionHeading number={3} title="Projects" />
            <p className="section-note">Showing {visibleProjects.length} project(s)</p>
            <div className="project-filters" role="tablist" aria-label="Project filters">
              {projectFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`filter-btn ${activeProjectFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveProjectFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="projects-grid">
              {visibleProjects.map((project) => (
                <article className="project-card reveal-on-scroll" key={project.title}>
                  <h3>{project.title}</h3>
                  <p className="project-subtitle">{project.subtitle}</p>
                  <p>{project.description}</p>
                  <p className="stack">
                    <strong>Tech Stack:</strong> {project.techStack}
                  </p>
                  <ExternalLink href={project.github} className="btn btn-small">
                    GitHub
                  </ExternalLink>
                </article>
              ))}
            </div>
          </section>

          <section className="section reveal-on-scroll" id="experience">
            <SectionHeading number={4} title="Experience" />
            <div className="timeline">
              {visibleExperience.map((item) => (
                <article className="timeline-item reveal-on-scroll" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
            {experience.length > 2 ? (
              <button
                type="button"
                className="btn btn-secondary experience-toggle"
                onClick={() => setShowAllExperience((prev) => !prev)}
              >
                {showAllExperience ? 'Show Less' : 'Show More'}
              </button>
            ) : null}
          </section>

          <section className="section reveal-on-scroll" id="achievements">
            <SectionHeading number={5} title="Achievements" />
            <div className="badge-row">
              {achievements.map((item) => (
                <span className="badge reveal-on-scroll" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="section reveal-on-scroll" id="github">
            <SectionHeading number={6} title="GitHub" />
            {githubLoading ? <p>Loading GitHub profile and repositories...</p> : null}
            {githubError ? <p>{githubError}</p> : null}

            {githubProfile && !githubError ? (
              <div className="github-panel reveal-on-scroll">
                <div className="github-header">
                  <img src={githubProfile.avatar_url} alt="GitHub avatar" className="github-avatar" />
                  <div>
                    <h3>{githubProfile.name || githubUsername}</h3>
                    <p>@{githubProfile.login}</p>
                  </div>
                </div>
                <div className="github-stats">
                  <div className="stat-item">
                    <strong>{githubProfile.public_repos}</strong>
                    <span>Public Repos</span>
                  </div>
                  <div className="stat-item">
                    <strong>{githubProfile.followers}</strong>
                    <span>Followers</span>
                  </div>
                  <div className="stat-item">
                    <strong>{githubProfile.following}</strong>
                    <span>Following</span>
                  </div>
                </div>
                <ExternalLink className="btn btn-primary" href={links.github}>
                  Open GitHub Profile
                </ExternalLink>
              </div>
            ) : null}

            {githubRepos.length ? (
              <div className="github-repos-grid">
                {githubRepos.map((repo) => (
                  <article className="project-card reveal-on-scroll" key={repo.id}>
                    <h3>{repo.name}</h3>
                    <p className="stack">
                      <strong>Language:</strong> {repo.language || 'N/A'}
                    </p>
                    <p className="stack">
                      <strong>Updated:</strong> {new Date(repo.updated_at).toLocaleDateString()}
                    </p>
                    <ExternalLink href={repo.html_url} className="btn btn-small">
                      View Repository
                    </ExternalLink>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <section className="section reveal-on-scroll" id="contact">
            <SectionHeading number={7} title="Contact" />
            <div className="contact-grid">
              <p>
                <strong>Location:</strong> {location}
              </p>
              <p>
                <strong>Phone:</strong> <a href={`tel:${phone}`}>{phone}</a>
              </p>
              <p>
                <strong>Email:</strong> <a href={`mailto:${links.email}`}>{links.email}</a>
              </p>
              <p>
                <strong>{social.linkedinLabel}:</strong>{' '}
                <ExternalLink href={links.linkedin}>
                  linkedin.com
                </ExternalLink>
              </p>
              <p>
                <strong>{social.githubLabel}:</strong>{' '}
                <ExternalLink href={links.github}>
                  {social.githubDisplay}
                </ExternalLink>
              </p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Your name" />

              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Your email" />

              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="4" placeholder="Your message"></textarea>

              <button type="submit" className="btn btn-primary">
                Send
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
