import { useQuery } from "react-query";
import Logo from "../../assets/SSWLogo.png";
import { FaClock } from "react-icons/fa";
import { formatDistanceStrict } from "date-fns";
import "./styles.css";

type WidgetProps = {
  rulesUrl?: string;
  userRulesUrl?: string;
  showLogo?: boolean;
  location?: string;
  skip?: number;
  ruleCount?: number;
  isDarkMode?: boolean;
  ruleEditor?: string;
};

export interface LatestRules {
  Id: string;
  Discriminator: string;
  CommitHash: string;
  RuleUri: string;
  RuleGuid: string;
  RuleName: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  CreatedBy: string;
  UpdatedBy: string;
  GitHubUsername: string;
}

const Widget = ({
  rulesUrl = "https://www.ssw.com.au/rules",
  userRulesUrl = "https://ssw.com.au/rules/user-rules/?author=",
  showLogo,
  location = window.location.href,
  skip = 0,
  ruleCount = 10,
  isDarkMode = false,
  ruleEditor,
}: WidgetProps) => {
  const sswUrl = "https://www.ssw.com.au";

  function getLastUpdatedTime(lastUpdatedDate: Date) {
    return formatDistanceStrict(new Date(lastUpdatedDate), new Date())
      .replace("minute", "min")
      .replace("second", "sec");
  }

  const { data, isLoading, error } = useQuery<LatestRules[]>(
    "latest-rules",
    async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}?skip=${skip}&take=${ruleCount}${
          ruleEditor ? `&githubUsername=${ruleEditor}` : ""
        }`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data);
      return data;
    }
  );

  console.log(location);

  function getContent() {
    if (isLoading) return <p>Loading...</p>;
    else if (error) return <p>There was an error: {error.toString()}</p>;
    else if (data) {
      return (
        <>
          {data.map((item, idx) => {
            return (
              <a
                key={`${item.Id}${idx}`}
                rel="noreferrer"
                target="_blank"
                href={`${rulesUrl}/${item.RuleUri}`}
              >
                <div className="rw-rule-card">
                  <p className="rw-rule-title">{item.RuleName}</p>
                  <p className="rw-rule-details">
                    <FaClock /> {getLastUpdatedTime(item.UpdatedAt)} ago
                  </p>
                </div>
              </a>
            );
          })}
          {ruleEditor ? (
            <div className="see-more-container">
              <a
                rel="noreferrer"
                target="_blank"
                className="rw-see-more"
                href={`${userRulesUrl}${ruleEditor}`}
              >
                See more
              </a>
            </div>
          ) : null}
        </>
      );
    }
  }

  return (
    <div className="rw-container">
      <div className="rw-title">
        {showLogo ? (
          <a href={sswUrl}>
            <img src={Logo} alt="SSW Logo" height="60" width="130"></img>
          </a>
        ) : (
          ""
        )}
        <h4>
          {location === rulesUrl ? (
            "Latest Rules"
          ) : (
            <a rel="noreferrer" target="_blank" href={`${rulesUrl}`}>
              Latest Rules
            </a>
          )}
        </h4>
      </div>
      <div className={`rw-rules-container ${isDarkMode ? "rw-dark" : ""}`}>
        {getContent()}
      </div>
    </div>
  );
};

export default Widget;
