"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.search.js");

require("core-js/modules/es.string.trim.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.string.includes.js");

require("core-js/modules/es.string.replace.js");

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactFontawesome = require("@fortawesome/react-fontawesome");

var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");

var _dateFns = require("date-fns");

var _SSWLogo = _interopRequireDefault(require("./assets/SSWLogo.png"));

require("./styles/style.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Widget extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      rules: [],
      isDarkMode: props.isDarkMode,
      author: props.author,
      numberOfRules: props.numberOfRules ? props.numberOfRules : 10
    };
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  extractFromRuleContent(term, text) {
    var start = text.substring(text.search("".concat(term, ":")));
    var value = start.substring(term.length + 1, start.search("\\n"));
    return value.trim();
  }

  async fetchPullRequests() {
    const pullRequests = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: "bearer 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"
      },
      body: JSON.stringify({
        query: "{\n        rateLimit {\n          remaining\n        }\n        search(query: \"repo:SSWConsulting/SSW.Rules.Content is:pr base:main is:merged sort:updated-desc ".concat(this.state.author ? "author:" + this.state.author : "", "\", type: ISSUE, first: ").concat(this.state.numberOfRules + 10, ") {\n          nodes {\n            ... on PullRequest {\n              author {\n                login\n              }\n              files(first: 10) {\n                nodes {\n                  path\n                }\n              }\n              mergedAt\n            }\n          }\n        }\n      }")
      })
    }).then(res => res.json());
    return pullRequests;
  }

  async fetchFileContents(list) {
    var returnList = [];
    var promises = [];

    for (var i = 0; i < this.state.numberOfRules; i++) {
      promises.push(fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: "bearer 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"
        },
        body: JSON.stringify({
          query: "{\n          rateLimit {\n            remaining\n          }\n          repository(name: \"SSW.Rules.Content\", owner: \"SSWConsulting\") {\n            object(expression: \"main:".concat(list[i], "\") {\n              ... on Blob {\n                text\n              }\n            }\n          }\n        }")
        })
      }));
    }

    await Promise.all(promises).then(values => Promise.all(values.map(res => res.json()))).then(values => values.forEach(obj => {
      if (obj.data.repository.object != null) {
        returnList = [...returnList, obj.data.repository.object.text];
      } else {
        returnList = [...returnList, null];
      }
    }));

    if (returnList.filter(x => x !== null).length < this.state.numberOfRules) {
      var counter = 0;

      while (returnList.filter(x => x !== null).length < this.state.numberOfRules) {
        var response = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: "bearer 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"
          },
          body: JSON.stringify({
            query: "{\n            rateLimit {\n              remaining\n            }\n            repository(name: \"SSW.Rules.Content\", owner: \"SSWConsulting\") {\n              object(expression: \"main:".concat(list[counter + this.state.numberOfRules], "\") {\n                ... on Blob {\n                  text\n                }\n              }\n            }\n          }")
          })
        }).then(res => res.json());

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
        if (!retrievalList.includes(file.path) && file.path.substring(file.path.length - 3) === ".md" && file.path.substring(0, 6) === "rules/") {
          retrievalList = [...retrievalList, file.path];
          rulesList = [...rulesList, {
            author: pr.author.login,
            timestamp: new Date(pr.mergedAt)
          }];
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
          rules: [...this.state.rules, {
            id: this.state.rules.length + 1,
            uri: uri,
            path: file.path,
            title: title,
            author: rulesList[i].author,
            timestamp: rulesList[i].timestamp
          }]
        });
      }
    }
  }

  determineTheme() {
    if (this.state.isDarkMode === undefined) {
      let browserDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
      this.setState({
        isDarkMode: browserDarkMode ? true : false
      });
    }
  }

  render() {
    const {
      error,
      isLoaded,
      rules
    } = this.state;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "rules-widget-container"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "rules-widget-title"
    }, /*#__PURE__*/_react.default.createElement("a", {
      href: "https://www.ssw.com.au/ssw"
    }, /*#__PURE__*/_react.default.createElement("img", {
      src: _SSWLogo.default,
      alt: "SSW Logo",
      height: "60",
      width: "130"
    })), /*#__PURE__*/_react.default.createElement("h1", null, /*#__PURE__*/_react.default.createElement("a", {
      rel: "noreferrer",
      target: "_blank",
      href: "https://www.ssw.com.au/rules/"
    }, "Latest Rules"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "rules-container ".concat(this.state.isDarkMode ? "dark" : "")
    }, error ? "Error: {error.message}" : !isLoaded ? "Loading..." : rules.map(item => /*#__PURE__*/_react.default.createElement("div", {
      key: item.id
    }, /*#__PURE__*/_react.default.createElement("p", {
      className: "rule-title"
    }, /*#__PURE__*/_react.default.createElement("a", {
      rel: "noreferrer",
      target: "_blank",
      href: "https://www.ssw.com.au/rules/".concat(item.uri)
    }, item.title)), /*#__PURE__*/_react.default.createElement("p", {
      className: "rule-details"
    }, /*#__PURE__*/_react.default.createElement(_reactFontawesome.FontAwesomeIcon, {
      icon: _freeSolidSvgIcons.faClock,
      className: "clock"
    }), " ", this.capitalizeFirstLetter((0, _dateFns.formatDistanceStrict)(item.timestamp, new Date()).replace("minute", "min").replace("second", "sec")), " ", "ago")))));
  }

}

Widget.propTypes = {
  author: _propTypes.default.string,
  isDarkMode: _propTypes.default.bool,
  numberOfRules: _propTypes.default.number.isRequired
};
var _default = Widget;
exports.default = _default;