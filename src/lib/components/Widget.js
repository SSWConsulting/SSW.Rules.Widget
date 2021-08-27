import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceStrict } from "date-fns";
import Logo from "./assets/SSWLogo.png";
import "./styles/style.css";

class Widget extends React.Component {
  // URLs
  sswUrl = "https://www.ssw.com.au";
  sswRulesUrl = "https://www.ssw.com.au/rules";
  apiBaseUrl = "https://api.github.com/graphql";

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
  
  determineTheme() {
    if (!this.state.isDarkMode) {
      let browserDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
      this.setState({
        isDarkMode: browserDarkMode ? true : false,
      });
    }
  }

  capitalizeFirstLetter(stringToCapitalize) {
    return stringToCapitalize.charAt(0).toUpperCase() + stringToCapitalize.slice(1);
  }

  extractFromRuleContent(term, text) {
    var start = text.substring(text.search(`${term}:`));
    var value = start.substring(term.length + 1, start.search("\\n"));
    return value.trim();
  }

  async setRules() {
    const pullRequests = await this.fetchPullRequests();

    var filesToRetrieve = []; 
    var additionalFileDetails = [];

    for (let pr of pullRequests) {
      for (let file of pr.files.nodes) {
        if (
          !filesToRetrieve.includes(file.path) &&
          file.path.substring(file.path.length - 3) === ".md" &&
          file.path.substring(0, 6) === "rules/"
        ) {

          filesToRetrieve = [...filesToRetrieve, file.path];

          additionalFileDetails = [
            ...additionalFileDetails,
            {
              author: pr.author.login,
              timestamp: new Date(pr.mergedAt),
            },
          ];
        }
      }
    }

    var retrievedFileContents = await this.fetchFileContents(filesToRetrieve);
    for (let [i, file] of retrievedFileContents.entries()) {
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
              author: additionalFileDetails[i].author,
              timestamp: additionalFileDetails[i].timestamp,
            },
          ],
        });
      }
    }
  }

  async fetchPullRequests() {
    const pullRequests = await this.requestPullRequests();
    pullRequests.sort((a, b) => new Date(b.mergedAt) - new Date(a.mergedAt));
    return pullRequests;
  }

  async fetchFileContents(filesToRetrieve) {
    var fileContents = await this.requestMultipleFileContents(filesToRetrieve);

    if (
      fileContents.filter((x) => x !== null).length < this.state.numberOfRules
    ) {
      var counter = 0;

      while (
        fileContents.filter((x) => x !== null).length < this.state.numberOfRules
      ) {
        var extraFile = await this.requestSingleFileContents(filesToRetrieve[counter + this.state.numberOfRules]);
        fileContents = [...fileContents, extraFile];
        counter++;
      }
    }
    return fileContents;
  }

  componentDidMount() {
    this.determineTheme();
    this.setRules();
  }

  

  render() {
    const { error, isLoaded, rules } = this.state;
    return (
      <div className="rules-widget-container">
        <div className="rules-widget-title">
          <a href={this.sswUrl}>
            <img src={Logo} alt="SSW Logo" height="60" width="130"></img>
          </a>
          <h1>
            <a rel="noreferrer" target="_blank" href={`${this.sswUrl}/rules`}>
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
                      href={`${this.sswUrl}/rules/${item.uri}`}
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

  // api request methods
  async requestPullRequests() {
    var response = await fetch(this.apiBaseUrl, {
      method: "POST",
      headers: {
        Authorization: `bearer ${process.env.REACT_APP_GITHUB_PAT}`,
      },
      body: JSON.stringify({
        query: `{
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
    }).then((res) => res.json())
    .catch(error => this.setState({ error: error }));
    
    return response.data.search.nodes || null;
  }

  async requestMultipleFileContents(list) {
    var promises = [];
    for (var i = 0; i < this.state.numberOfRules; i++) {
      promises.push(
        fetch(this.apiBaseUrl, {
          method: "POST",
          headers: {
            Authorization: `bearer ${process.env.REACT_APP_GITHUB_PAT}`,
          },
          body: JSON.stringify({
            query: `{
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

    var contents = [];
    await Promise.all(promises)
      .then((values) => Promise.all(values.map((res) => res.json())))
      .then((values) =>
        values.forEach((obj) => {
          if (obj.data.repository.object != null) {
            contents = [...contents, obj.data.repository.object.text];
          } else {
            contents = [...contents, null];
          }
        }))
      .catch(error => this.setState({ error: error }));
    
    return contents || null;
  }

  async requestSingleFileContents(file) {
    var response = await fetch(this.apiBaseUrl, {
      method: "POST",
      headers: {
        Authorization: `bearer ${process.env.REACT_APP_GITHUB_PAT}`,
      },
      body: JSON.stringify({
        query: `{
        rateLimit {
          remaining
        }
        repository(name: "SSW.Rules.Content", owner: "SSWConsulting") {
          object(expression: "main:${file}") {
            ... on Blob {
              text
            }
          }
        }
      }`,
      }),
    }).then((res) => res.json())
    .catch(error => this.setState({ error: error }));

    return response.data.repository.object.text || null;
  }
}

Widget.propTypes = {
  author: PropTypes.string,
  isDarkMode: PropTypes.bool,
  numberOfRules: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired
};

export default Widget;
