function ExternalLink({ href, className, children }) {
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export default ExternalLink;
