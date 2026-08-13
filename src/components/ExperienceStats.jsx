function ExperienceStats({ experience, achievements, projectCount }) {
  const stats = [
    { label: 'Projects', value: projectCount },
    { label: 'Roles', value: experience.length },
    { label: 'Highlights', value: achievements.length },
  ];

  return (
    <section className="section experience-section" id="experience">
      <div className="experience-band">
        <div className="section-header-row">
          <div>
            <p className="section-label">Experience</p>
            <h2>Leadership & impact</h2>
          </div>
        </div>

        <div className="stats-row" aria-label="Portfolio statistics">
          {stats.map((stat) => (
            <div className="stat-pill" key={stat.label} data-count={stat.value}>
              <strong className="stat-value">0</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="experience-list">
        {experience.map((item) => (
          <article className="experience-item" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <div className="achievements-block" id="achievements">
        <p className="section-label">Achievements</p>
        <ul className="achievement-list">
          {achievements.map((item) => (
            <li className="achievement-item" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default ExperienceStats;
