import { useQuery } from "@tanstack/react-query";
import { FaClock } from "react-icons/fa";
import { formatDistanceStrict } from "date-fns";
import { WidgetConstants } from "./widget-constants.enum";
import Logo from "../../assets/SSWLogo.png";
import "./styles.css";

export interface WidgetProps {
  showLogo?: boolean;
  location?: string;
  numberOfRules?: number;
  author?: string;
}

export interface Rule {
  file: string;
  title: string;
  uri: string;
  isArchived?: boolean;
  lastUpdated: string;
  lastUpdatedBy?: string;
  lastUpdatedByEmail?: string;
  created?: string;
  createdBy?: string;
  createdByEmail?: string;
}

interface FileChanged {
  path: string;
  title: string;
  uri: string;
}

interface Commit {
  FilesChanged: FileChanged[];
  CommitTime: string;
}

interface UserCommits {
  user: string;
  authorName: string;
  commits: Commit[];
}

const Widget = ({
  showLogo = false,
  location,
  numberOfRules = 10,
  author,
}: WidgetProps) => {
  let rulesUrl = WidgetConstants.ProdRulesUrl;
  let latestRulesUrl = WidgetConstants.ProdLatestRulesUrl;
  let historyJsonUrl = import.meta.env.VITE_PROD_HISTORY_JSON_URL;
  let commitsJsonUrl = import.meta.env.VITE_PROD_COMMITS_JSON_URL;

  if (
    location === WidgetConstants.StagingRulesUrl ||
    location === WidgetConstants.StagingPeopleUrl
  ) {
    rulesUrl = WidgetConstants.StagingRulesUrl;
    latestRulesUrl = WidgetConstants.StagingLatestRulesUrl;
    historyJsonUrl = import.meta.env.VITE_STAGING_HISTORY_JSON_URL;
    commitsJsonUrl = import.meta.env.VITE_STAGING_COMMITS_JSON_URL;
  }

  const seeMoreUrl = author
    ? `${WidgetConstants.UserRulesUrl}${author}`
    : `${latestRulesUrl}`;

  function getLastUpdatedTime(lastUpdatedDate: string) {
    return formatDistanceStrict(new Date(lastUpdatedDate), new Date())
      .replace("minute", "min")
      .replace("second", "sec");
  }

  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
  } = useQuery<Rule[]>({
    queryKey: ["history"],
    queryFn: async () => {
      const response = await fetch(historyJsonUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch history.json");
      }
      return await response.json();
    },
  });

  const {
    data: commitsData,
    isLoading: commitsLoading,
    error: commitsError,
  } = useQuery<UserCommits[]>({
    enabled: !!author,
    queryKey: ["commits"],
    queryFn: async () => {
      const response = await fetch(commitsJsonUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch commits.json");
      }
      return await response.json();
    },
  });

  let latestRules: Rule[] = [];

  // this section is for widget when it is used in Rules page
  if (!author && historyData) {
    latestRules = historyData.sort((a, b) => {
      if (new Date(a.lastUpdated) < new Date(b.lastUpdated)) return 1;
      if (new Date(a.lastUpdated) > new Date(b.lastUpdated)) return -1;
      return 0;
    });

    latestRules = latestRules.filter(
      (rule) =>
        !rule.isArchived && rule.uri && rule.file.indexOf("categories") < 0
    );

    latestRules = latestRules.slice(0, numberOfRules);
  }

  // this section is for widget when it is used People's Profile page
  if (author && commitsData && historyData) {
    const fileMap = new Map<string, { commit: Commit; file: FileChanged }>();
    const userCommits = commitsData.find((user) => user.user === author);

    if (userCommits) {
      userCommits.commits.forEach((commit) => {
        commit.FilesChanged.forEach((file) => {
          const existingFile = fileMap.get(file.path);
          if (
            !existingFile ||
            new Date(commit.CommitTime) >
              new Date(existingFile.commit.CommitTime)
          ) {
            fileMap.set(file.path, { commit, file });
          }
        });
      });

      latestRules = Array.from(fileMap.values()).map(({ file, commit }) => ({
        file: file.path,
        title: file.title,
        uri: file.uri,
        lastUpdated: commit.CommitTime,
      }));

      latestRules = latestRules.filter((rule) =>
        historyData.find(
          (historyRule) =>
            historyRule.file === rule.file && !historyRule.isArchived
        )
      );

      latestRules = latestRules.slice(0, numberOfRules);
    }
  }

  function getContent() {
    if (historyLoading || commitsLoading)
      return <p className="rw-title">Loading...</p>;
    else if (historyError || commitsError)
      return <p className="rw-title">No Rules Found</p>;
    else if (latestRules) {
      return (
        <>
          {latestRules.map((item, idx) => {
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
          <div className="see-more-container">
            <a
              rel="noreferrer"
              target="_blank"
              className="rw-see-more"
              href={`${seeMoreUrl}`}
            >
              See more
            </a>
          </div>
        </>
      );
    }
  }

  return (
    <div className="rw-container">
      <div className="rw-title">
        {showLogo ? (
          <a href={WidgetConstants.SSWUrl}>
            <img src={Logo} alt="SSW Logo" height="60" width="130"></img>
          </a>
        ) : (
          ""
        )}
        <h4>
          {location === WidgetConstants.ProdRulesUrl ||
          location === WidgetConstants.StagingRulesUrl ? (
            "Latest Rules"
          ) : (
            <a rel="noreferrer" target="_blank" href={`${latestRulesUrl}`}>
              Rules Contributions
            </a>
          )}
        </h4>
      </div>
      <div className={`rw-rules-container`}>{getContent()}</div>
    </div>
  );
};

export default Widget;
