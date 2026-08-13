import { useEffect, useMemo, useState } from 'react';
import { portfolioData } from './portfolioData';
import Header from './components/Header';
import Hero from './components/Hero';
import ThemeBridge from './components/ThemeBridge';
import ContactBridge from './components/ContactBridge';
import About from './components/About';
import SelectedWork from './components/SelectedWork';
import ExperienceStats from './components/ExperienceStats';
import GithubSection from './components/GithubSection';
import CodingProfilesLead from './components/CodingProfilesLead';
import Contact from './components/Contact';
import BgDecor from './components/BgDecor';
import { useSmoothScroll } from './motion/useSmoothScroll';
import { initPageMotion } from './motion/initPageMotion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
    codechefProblemsSolved,
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

  useSmoothScroll();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const header = document.querySelector('.site-header');
    if (!header) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return undefined;

    // Opacity-only: avoid transform on sticky header (breaks sticky / can leave nav invisible)
    const tween = gsap.from(header, {
      opacity: 0,
      duration: 0.55,
      ease: 'power2.out',
      delay: 0.02,
      onComplete: () => {
        gsap.set(header, { clearProps: 'opacity,transform' });
      },
    });

    return () => {
      tween.kill();
      gsap.set(header, { clearProps: 'opacity,transform' });
    };
  }, []);

  useEffect(() => {
    const cleanup = initPageMotion();
    return cleanup;
  }, [projects, experience]);

  // Github content changes page height — refresh pins without tearing down motion
  useEffect(() => {
    if (githubLoading) return undefined;
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(id);
  }, [githubLoading]);

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

          <ThemeBridge mode="enter">
            <About
              about={about}
              careerObjective={careerObjective}
              education={education}
              skills={skills}
              heroImage={heroImage}
            />
          </ThemeBridge>

          <div className="dark-chapter">
            <BgDecor variant="chapter" />

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
          </div>

          <ContactBridge
            lead={
              <CodingProfilesLead
                leetcodeUsername={social.leetcodeDisplay}
                leetcodeUrl={links.leetcode}
                codechefUsername={social.codechefDisplay}
                codechefUrl={links.codechef}
                codechefProblemsSolved={codechefProblemsSolved}
              />
            }
          >
            <Contact
              location={location}
              phone={phone}
              links={links}
              social={social}
              careerObjective={careerObjective}
              onSubmit={handleSubmit}
            />
          </ContactBridge>
        </main>
      </div>
    </div>
  );
}

export default App;
