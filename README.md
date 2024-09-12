
# SSW.Rules.Widget

A Widget to display recent rules from SSW Rules

This is a React component, published as an NPM package to be installed on other sites. It retrieves data from [SSW.Rules.Content](https://www.github.com/SSWConsulting/SSW.Rules.Content) and displays the most recently updated rules.

## NPM Package

### Installation

```console
npm i ssw.rules.widget
```

### Usage

```javascript
import { RulesWidget } from 'ssw.rules.widget';

function ExamplePage() {
  return (
    <>
      /* Simplest implementation */
      <RulesWidget />

      /* Using all the options */
      <RulesWidget skip={5} rulesUrl={"#"} userRulesUrl={"#?="} showLogo={true} numberOfRules={5} author={authorGitHubUsername} location={window.location}/>
    </>
  );
}
```

### Props

| Name          | Type    | Default                                                                                                   | Required | Use                                                                                                                   |
|---------------|---------|-----------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------|
| rulesUrl      | string  | "<https://www.ssw.com.au/rules>"                                                                            | No       | URL for the SSW rules list.                                                                                            |
| userRulesUrl  | string  | "<https://ssw.com.au/rules/user-rules/?author=>" | No       | URL for the user's specific SSW rules list. Only defined if author is provided.                                        |
| showLogo      | boolean | false                                                                                                 | No       | Whether to show the SSW logo. Defaults to true if not explicitly set.                                                  |
| location      | string  | ${window.location.href}                                                                                   | No       | Current URL of the page hosting the widget.                                                                            |
| skip          | number  | 0                                                                                                         | No       | Index of the first rule to display in the widget.                                                                      |
| numberOfRules | number  | 10                                                                                                        | No       | Number of rules to display in the widget.                                                                              |                                                                           |
| author        | string  | null                                                                                                      | No       | GitHub username of the author to filter rules by.                                                                      |
