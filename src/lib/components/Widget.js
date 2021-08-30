import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceStrict } from "date-fns";
import Logo from "./assets/SSWLogo.png";
import "./styles/style.css";
import {
  requestPullRequests,
  requestSingleFileContents,
  requestMultipleFileContents,
} from "./api.js";

class Widget extends React.Component {
  sswUrl = "https://www.ssw.com.au";
  sswRulesUrl = "https://www.ssw.com.au/rules";

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      rules: [],
      isDarkMode: props.isDarkMode,
      author: props.author,
      numberOfRules: props.numberOfRules > 0 ? props.numberOfRules : 10,
      token: props.token,
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
    return (
      stringToCapitalize.charAt(0).toUpperCase() + stringToCapitalize.slice(1)
    );
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
          (file.path.substring(file.path.length - 3) === ".md" ||
            file.path.substring(file.path.length - 9) === ".markdown") &&
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
    const pullRequests = await requestPullRequests(
      this.state.numberOfRules,
      this.state.author,
      this.state.token
    );
    pullRequests.sort((a, b) => new Date(b.mergedAt) - new Date(a.mergedAt));
    return pullRequests;
  }

  async fetchFileContents(filesToRetrieve) {
    var fileContents = await requestMultipleFileContents(
      filesToRetrieve,
      this.state.numberOfRules,
      this.state.token
    );

    if (
      fileContents.filter((x) => x !== null).length < this.state.numberOfRules
    ) {
      var counter = 0;

      while (
        fileContents.filter((x) => x !== null).length < this.state.numberOfRules
      ) {
        var extraFile = await requestSingleFileContents(
          filesToRetrieve[counter + this.state.numberOfRules],
          this.state.token
        );
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
}

Widget.propTypes = {
  author: PropTypes.string,
  isDarkMode: PropTypes.bool,
  numberOfRules: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
};

export default Widget;
