function About({ about, careerObjective, education, skills, heroImage }) {
  return (
    <section className="section about-section about-section--dark" id="about">
      <div className="about-panel">
        <div className="about-visual" aria-hidden="true">
          <div className="about-visual-frame">
            <img src={heroImage} alt="" className="about-visual-img" />
          </div>
          <div className="about-visual-blob" />
        </div>

        <div className="about-intro">
          <p className="section-label">About</p>
          <h2>Nice to meet you.</h2>
          <p className="about-lead">{about}</p>
          <p className="about-objective">{careerObjective}</p>

          <div className="education-chip">
            <span className="education-chip-label">Education</span>
            <p className="education-degree">{education.degree}</p>
            <p className="education-meta">
              {education.institution} · {education.location}
            </p>
            <p className="education-cgpa">CGPA {education.cgpa}</p>
          </div>
        </div>

        <div className="about-skills" id="skills">
          <p className="section-label">Focus areas</p>
          <ul className="focus-list">
            {skills.map((group) => (
              <li className="focus-item" key={group.title}>
                <span className="focus-dot" aria-hidden="true" />
                <div>
                  <h3>{group.title}</h3>
                  <p>{group.items.slice(0, 4).join(' · ')}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default About;
