import LeetCodeSection from './LeetCodeSection';
import CodeChefSection from './CodeChefSection';

/** Stacked coding profiles for the ContactBridge lead page. */
function CodingProfilesLead({
  leetcodeUsername,
  leetcodeUrl,
  codechefUsername,
  codechefUrl,
  codechefProblemsSolved,
}) {
  return (
    <div className="coding-profiles-lead">
      <LeetCodeSection username={leetcodeUsername} profileUrl={leetcodeUrl} />
      <CodeChefSection
        username={codechefUsername}
        profileUrl={codechefUrl}
        problemsSolved={codechefProblemsSolved}
      />
    </div>
  );
}

export default CodingProfilesLead;
