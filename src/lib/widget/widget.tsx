import { useQuery } from "@tanstack/react-query";
import Logo from "../../assets/SSWLogo.png";
import { FaClock } from "react-icons/fa";
import { formatDistanceStrict } from "date-fns";
import "./styles.css";

const historyJsonUrl = import.meta.env.VITE_HISTORY_JSON_URL;
const githubApiToken = import.meta.env.VITE_GITHUB_API_PAT;
const githubOrg = import.meta.env.VITE_GITHUB_ORG;
const githubRepo = import.meta.env.VITE_GITHUB_REPO;

export interface WidgetProps {
  rulesUrl?: string;
  userRulesUrl?: string;
  showLogo?: boolean;
  location?: string;
  skip?: number;
  numberOfRules?: number;
  author?: string;
}

export interface Rule {
  file: string;
  title: string;
  uri: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  lastUpdatedByEmail: string;
  created: string;
  createdBy: string;
  createdByEmail: string;
}

interface RuleMetadata {
  title: string;
  uri: string;
}

const Widget = ({
  rulesUrl = "https://www.ssw.com.au/rules",
  userRulesUrl = "https://www.ssw.com.au/rules/user/?author=",
  showLogo = false,
  location,
  skip = 0,
  numberOfRules = 10,
  author,
}: WidgetProps) => {
  const sswUrl = "https://www.ssw.com.au";

  function getLastUpdatedTime(lastUpdatedDate: string) {
    return formatDistanceStrict(new Date(lastUpdatedDate), new Date())
      .replace("minute", "min")
      .replace("second", "sec");
  }

  // get title and uri of the rule from the markdown file
  const fetchRuleMetaData = async (path: string): Promise<RuleMetadata> => {
    const response = await fetch(
      `https://api.github.com/repos/${githubOrg}/${githubRepo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${githubApiToken}`,
        }
      }
    );
  
    if (!response.ok) {
      throw new Error(`GitHub API request failed with status while fetching rule metadata: ${response.status}`);
    }
  
    const data = await response.json();
    const content = atob(data.content);
    
    // Parse title
    const titleLine = content.split('\n').find((line) => line.startsWith('title:'));
    const title = titleLine!.substring(7).trim();


    // Parse uri
    const uriLine = content.split('\n').find((line) => line.startsWith('uri:'));
    const uri = uriLine ? uriLine.substring(4).trim() : '';

    return { title, uri };
  };

  // get rules from history.json, sort by last updated date and take only the number of rules specified
  const { data: rulesData, isLoading: rulesLoading, error: rulesError } = useQuery<Rule[]>({
    queryKey: ["latest-rules"],
    queryFn: async () => {
      const response = await fetch(historyJsonUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const fetchedData: Rule[] = await response.json();

      fetchedData.sort((a, b) => {
        if (a.lastUpdated < b.lastUpdated) return 1;
        if (a.lastUpdated > b.lastUpdated) return -1;
        return 0;
      });

      const paginatedData: Rule[] = fetchedData.slice(skip, numberOfRules);

      return paginatedData;
    },
  });

  // set title and uri for each rule
  const { data: rulesWithTitles, isLoading: titlesLoading, error: titlesError } = useQuery<Rule[]>({
    queryKey: ["rules-with-titles", rulesData],
    queryFn: async () => {
      if (!rulesData) return [];
  
      return Promise.all(
        rulesData.map(async (rule) => {
          const metaData: RuleMetadata = await fetchRuleMetaData(rule.file);
          rule.title = metaData.title;
          rule.uri = metaData.uri;
          return rule;
        })
      );
    },
    enabled: !!rulesData
  });

  function getContent() {
    if (rulesLoading || titlesLoading) return <p className="rw-title">Loading...</p>;
    else if (rulesError || titlesError) return <p className="rw-title">No Rules Found</p>;
    else if (rulesData && rulesWithTitles) {
      return (
        <>
          {rulesWithTitles.map((item, idx) => {
            return (
              <a
                key={`${item.file}${idx}`}
                rel="noreferrer"
                target="_blank"
                href={`${rulesUrl}/${item.uri}`}
              >
                <div className="rw-rule-card">
                  <p className="rw-rule-title">{item.title}</p>
                  <p className="rw-rule-details">
                    <span className="rw-icon-flex">
                      <FaClock size={14} />
                    </span>
                    {getLastUpdatedTime(item.lastUpdated)} ago
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
