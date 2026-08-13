function Header({
  siteName,
  navItems,
  menuOpen,
  onMenuToggle,
  onLinkClick,
  contactHref,
  isDarkTheme,
  onThemeToggle,
}) {
  return (
    <header className="site-header">
      <a href="#hero" className="logo">
        {siteName}
      </a>

      <div className="header-actions">
        <button
          className="theme-toggle"
          type="button"
          aria-label="Toggle dark mode"
          onClick={onThemeToggle}
        >
          {isDarkTheme ? 'Light' : 'Dark'}
        </button>
        <button
          className="menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={onMenuToggle}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav className={`site-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
        {navItems.map((item) => (
          <a key={item.id} href={`#${item.id}`} onClick={onLinkClick}>
            {item.label}
          </a>
        ))}
        <a href={contactHref} className="nav-cta" onClick={onLinkClick}>
          Let&apos;s Connect
        </a>
      </nav>
    </header>
  );
}

export default Header;
