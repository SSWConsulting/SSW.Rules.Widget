import { useQuery } from "@tanstack/react-query";
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
  id: string;
  discriminator: string;
  commitHash: string;
  ruleUri: string;
  ruleGuid: string;
  ruleName: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  gitHubUsername: string;
}

const Widget = ({
  latestRulesUrl = "https://sswrules-prod-functions.azurewebsites.net/api/GetLatestRules",
  rulesUrl = "https://www.ssw.com.au/rules",
  userRulesUrl = "https://www.ssw.com.au/rules/user/?author=",
  showLogo = false,
  location,
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

  const { data, isLoading, error } = useQuery<LatestRules[]>({
    queryKey: ["latest-rules"],
    queryFn: async () => {
      const response = await fetch(
        `${latestRulesUrl}?skip=${skip}&take=${numberOfRules}${
          author ? `&githubUsername=${author}` : ""
        }`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    },
  });

  function getContent() {
    if (isLoading) return <p className="rw-title">Loading...</p>;
    else if (error) return <p className="rw-title">No Rules Found</p>;
    else if (data) {
      return (
        <>
          {data.map((item, idx) => {
            return (
              <a
                key={`${item.id}${idx}`}
                rel="noreferrer"
                target="_blank"
                href={`${rulesUrl}/${item.ruleUri}`}
              >
                <div className="rw-rule-card">
                  <p className="rw-rule-title">{item.ruleName}</p>
                  <p className="rw-rule-details">
                    <span className="rw-icon-flex">
                      <FaClock size={14} />
                    </span>
                    {getLastUpdatedTime(item.updatedAt)} ago
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
