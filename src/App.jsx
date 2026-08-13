import { useEffect, useMemo, useState } from 'react';
import { portfolioData } from './portfolioData';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import SelectedWork from './components/SelectedWork';
import ExperienceStats from './components/ExperienceStats';
import GithubSection from './components/GithubSection';
import Contact from './components/Contact';

const THEME_STORAGE_KEY = 'portfolio-theme';

const navItems = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'github', label: 'GitHub' },
  { id: 'contact', label: 'Contact' },
];

function getGithubUsername(githubUrl) {
  const match = githubUrl.match(/github\.com\/([^/]+)/i);
  return match?.[1] ?? '';
}

function App() {
  const {
    siteName,
    name,
    title,
    intro,
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
  }, [projects, experience, githubLoading]);

  return (
    <div className="page-wrap">
      <div className="page-shell">
        <Header
          siteName={siteName}
          navItems={navItems}
          menuOpen={menuOpen}
          onMenuToggle={handleMenuToggle}
          onLinkClick={handleLinkClick}
          contactHref="#contact"
          isDarkTheme={isDarkTheme}
          onThemeToggle={handleThemeToggle}
        />

        <main>
          <Hero
            name={name}
            title={title}
            intro={intro}
            heroImage={heroImage}
            location={location}
          />

          <About
            about={about}
            careerObjective={careerObjective}
            education={education}
            skills={skills}
            heroImage={heroImage}
          />

          <SelectedWork projects={projects} />

          <ExperienceStats
            experience={experience}
            achievements={achievements}
            projectCount={projects.length}
          />

          <GithubSection
            loading={githubLoading}
            error={githubError}
            profile={githubProfile}
            repos={githubRepos}
            username={githubUsername}
            profileUrl={links.github}
          />

          <Contact
            location={location}
            phone={phone}
            links={links}
            social={social}
            careerObjective={careerObjective}
            onSubmit={handleSubmit}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
