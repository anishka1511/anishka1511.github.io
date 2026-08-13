import ExternalLink from './ExternalLink';

function Contact({ location, phone, links, social, careerObjective, onSubmit }) {
  return (
    <section className="section contact-section reveal-on-scroll" id="contact">
      <div className="contact-banner">
        <div className="contact-banner-copy">
          <p className="section-label">Contact</p>
          <h2>Let&apos;s connect.</h2>
          <p className="contact-lead">{careerObjective}</p>
          <a className="btn btn-primary" href={`mailto:${links.email}`}>
            Say Hello
          </a>
        </div>

        <div className="contact-details">
          <p>
            <span>Location</span>
            <strong>{location}</strong>
          </p>
          <p>
            <span>Phone</span>
            <a href={`tel:${phone}`}>{phone}</a>
          </p>
          <p>
            <span>Email</span>
            <a href={`mailto:${links.email}`}>{links.email}</a>
          </p>
          <p>
            <span>{social.linkedinLabel}</span>
            <ExternalLink href={links.linkedin}>linkedin.com</ExternalLink>
          </p>
          <p>
            <span>{social.githubLabel}</span>
            <ExternalLink href={links.github}>{social.githubDisplay}</ExternalLink>
          </p>
        </div>
      </div>

      <form className="contact-form" onSubmit={onSubmit}>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" placeholder="Your name" />

        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" placeholder="Your email" />

        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows="4" placeholder="Your message"></textarea>

        <button type="submit" className="btn btn-primary">
          Send Message
        </button>
      </form>
    </section>
  );
}

export default Contact;
