import { useQuery } from "react-query";
import Logo from "../../assets/SSWLogo.png";
import { FaClock } from "react-icons/fa";
import { formatDistanceStrict } from "date-fns";
import "./styles.css";

export interface WidgetProps {
  rulesUrl?: string;
  userRulesUrl?: string;
  showLogo?: boolean;
  location?: string;
  skip?: number;
  numberOfRules?: number;
  author?: string;
  latestRulesUrl?: string;
}

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
  latestRulesUrl = "https://sswrules-staging-functions.azurewebsites.net/api/GetLatestRules",
  rulesUrl = "https://www.ssw.com.au/rules",
  userRulesUrl = "https://www.ssw.com.au/rules/user/?author=",
  showLogo = false,
  location = window.location.href,
  skip = 0,
  numberOfRules = 10,
  author,
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
        `${latestRulesUrl}?skip=${skip}&take=${numberOfRules}${
          author ? `&githubUsername=${author}` : ""
        }`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    }
  );

  function getContent() {
    if (isLoading) return <p className="rw-title">Loading...</p>;
    else if (error) return <p className="rw-title">No Rules Found</p>;
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
          {author ? (
            <div className="see-more-container">
              <a
                rel="noreferrer"
                target="_blank"
                className="rw-see-more"
                href={`${userRulesUrl}${author}`}
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
      <div className={`rw-rules-container`}>{getContent()}</div>
    </div>
  );
};

export default Widget;
