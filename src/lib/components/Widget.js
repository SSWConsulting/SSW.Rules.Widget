import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceStrict } from "date-fns";
import Logo from "./assets/SSWLogo.png";
import "./styles/style.css";
import { getRules } from "./business";

class Widget extends React.Component {
  sswUrl = "https://www.ssw.com.au";
  sswRulesUrl = "https://www.ssw.com.au/rules";

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      showLogo: props.showLogo,
      isLoaded: false,
      rules: [],
      isDarkMode: props.isDarkMode,
      author: props.author,
      numberOfRules: props.numberOfRules > 0 ? props.numberOfRules : 10,
      token: props.token,
    };
  }

  async setRulesToDisplay() {
    var arrayOfRules = await getRules(this.state);
    this.setState({
      isLoaded: true,
      rules: [
        ...this.state.rules,
        ...arrayOfRules
      ]
    });
  }  

  determineTheme() {
    if (typeof this.state.isDarkMode != 'boolean') {
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

  componentDidMount() {
    this.determineTheme();
    this.setRulesToDisplay();
  }

  render() {
    const { error, isLoaded, rules, showLogo } = this.state;
    return (
      <div className="rw-container">
        
        <div className="rw-title" style={{marginBottom: '16px'}}>
        {showLogo ? (
          <a href={this.sswUrl} >
            <img src={Logo} alt="SSW Logo" height="60" width="130"></img>
          </a>
        ) : ''}
          <h1>
            <a rel="noreferrer" target="_blank" href={`${this.sswUrl}/rules`}>
              Latest Rules
            </a>
          </h1>
        </div>
        <div
          className={`rw-rules-container ${this.state.isDarkMode ? "dark" : ""}`}
        >
          {error
            ? "Error: {error.message}"
            : !isLoaded
            ? "Loading..."
            : rules.map((item) => (
                <div key={item.id}>
                  <p className="rw-rule-title">
                    <a
                      rel="noreferrer"
                      target="_blank"
                      href={`${this.sswUrl}/rules/${item.uri}`}
                    >
                      {item.title}
                    </a>
                  </p>
                  <p className="rw-rule-details">
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
  showLogo: PropTypes.bool,
  numberOfRules: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
};

Widget.defaultProps = {
  showLogo: true
}

export default Widget;