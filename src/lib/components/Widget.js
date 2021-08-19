import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceStrict } from "date-fns";
import Logo from "./assets/SSWLogo.png";
import "./styles/style.css";

class Widget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      rules: [],
      isDarkMode: props.isDarkMode,
      author: props.author,
      numberOfRules: props.numberOfRules ? props.numberOfRules : 10,
    };
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  extractFromRuleContent(term, text) {
    var start = text.substring(text.search(`${term}:`));
    var value = start.substring(term.length + 1, start.search("\\n"));
    return value.trim();
  }

  async fetchPullRequests() {
    const pullRequests = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: "bearer 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",
      },
      body: JSON.stringify({
        query: `{
        rateLimit {
          remaining
        }
        search(query: "repo:SSWConsulting/SSW.Rules.Content is:pr base:main is:merged sort:updated-desc ${
          this.state.author ? "author:" + this.state.author : ""
        }", type: ISSUE, first: ${this.state.numberOfRules + 10}) {
          nodes {
            ... on PullRequest {
              author {
                login
              }
              files(first: 10) {
                nodes {
                  path
                }
              }
              mergedAt
            }
          }
        }
      }`,
      }),
    }).then((res) => res.json());
    return pullRequests;
  }

  async fetchFileContents(list) {
    var returnList = [];
    var promises = [];
    for (var i = 0; i < this.state.numberOfRules; i++) {
      promises.push(
        fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: "bearer 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",
          },
          body: JSON.stringify({
            query: `{
          rateLimit {
            remaining
          }
          repository(name: "SSW.Rules.Content", owner: "SSWConsulting") {
            object(expression: "main:${list[i]}") {
              ... on Blob {
                text
              }
            }
          }
        }`,
          }),
        })
      );
    }
    await Promise.all(promises)
      .then((values) => Promise.all(values.map((res) => res.json())))
      .then((values) =>
        values.forEach((obj) => {
          if (obj.data.repository.object != null) {
            returnList = [...returnList, obj.data.repository.object.text];
          } else {
            returnList = [...returnList, null];
          }
        })
      );
    if (
      returnList.filter((x) => x !== null).length < this.state.numberOfRules
    ) {
      var counter = 0;
      while (
        returnList.filter((x) => x !== null).length < this.state.numberOfRules
      ) {
        var response = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: "bearer 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",
          },
          body: JSON.stringify({
            query: `{
            rateLimit {
              remaining
            }
            repository(name: "SSW.Rules.Content", owner: "SSWConsulting") {
              object(expression: "main:${
                list[counter + this.state.numberOfRules]
              }") {
                ... on Blob {
                  text
                }
              }
            }
          }`,
          }),
        }).then((res) => res.json());
        if (response.data.repository.object != null) {
          returnList = [...returnList, response.data.repository.object.text];
        } else {
          returnList = [...returnList, null];
        }
        counter++;
      }
    }
    return returnList;
  }

  async componentDidMount() {
    this.determineTheme();
    const pullRequests = await this.fetchPullRequests();
    var retrievalList = [];
    var rulesList = [];
    for (let pr of pullRequests.data.search.nodes) {
      for (let file of pr.files.nodes) {
        if (
          !retrievalList.includes(file.path) &&
          file.path.substring(file.path.length - 3) === ".md" &&
          file.path.substring(0, 6) === "rules/"
        ) {
          retrievalList = [...retrievalList, file.path];
          rulesList = [
            ...rulesList,
            {
              author: pr.author.login,
              timestamp: new Date(pr.mergedAt),
            },
          ];
        }
      }
    }
    var files = await this.fetchFileContents(retrievalList);
    for (let [i, file] of files.entries()) {
      if (file != null) {
        var title = this.extractFromRuleContent("title", file);
        var uri = this.extractFromRuleContent("uri", file);
        this.setState({
          isLoaded: true,
          rules: [
            ...this.state.rules,
            {
              id: this.state.rules.length + 1,
              uri: uri,
              path: file.path,
              title: title,
              author: rulesList[i].author,
              timestamp: rulesList[i].timestamp,
            },
          ],
        });
      }
    }
  }

  determineTheme() {
    if (this.state.isDarkMode === undefined) {
      let browserDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
      this.setState({
        isDarkMode: browserDarkMode ? true : false,
      });
    }
  }

  render() {
    const { error, isLoaded, rules } = this.state;
    return (
      <div className="rules-widget-container">
        <div className="rules-widget-title">
          <a href="https://www.ssw.com.au/ssw">
            <img src={Logo} alt="SSW Logo" height="60" width="130"></img>
          </a>
          <h1>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://www.ssw.com.au/rules/"
            >
              Latest Rules
            </a>
          </h1>
        </div>
        <div
          className={`rules-container ${this.state.isDarkMode ? "dark" : ""}`}
        >
          {error
            ? "Error: {error.message}"
            : !isLoaded
            ? "Loading..."
            : rules.map((item) => (
                <div key={item.id}>
                  <p className="rule-title">
                    <a
                      rel="noreferrer"
                      target="_blank"
                      href={`https://www.ssw.com.au/rules/${item.uri}`}
                    >
                      {item.title}
                    </a>
                  </p>
                  <p className="rule-details">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="clock"
                    ></FontAwesomeIcon>{" "}
                    {this.capitalizeFirstLetter(
                      formatDistanceStrict(item.timestamp, new Date())
                        .replace("minute", "min")
                        .replace("second", "sec")
                    )}{" "}
                    ago
                  </p>
                </div>
              ))}
        </div>
      </div>
    );
  }
}

Widget.propTypes = {
  author: PropTypes.string,
  isDarkMode: PropTypes.bool,
  numberOfRules: PropTypes.number.isRequired,
};

export default Widget;
