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
import { Widget } from 'ssw.rules.widget';
```

### Personal Access Token
The SSW Rules Widget requires a GitHub personal access token to retrieve the data.
1. Login at https://www.github.com/
2. Click the profile image in the top right corner and select Settings
3. Select Developer settings | Personal access tokens | Generate new token
4. Enter your password to confirm access
5. Set your new token with the following permissions:
```
user
public_repo
repo
repo_deployment
repo:status
read:repo_hook
read:org
read:public_key
read:gpg_key
```
6. Click 'Generate token' and copy your new personal access token
7. Store your personal access token somewhere secure in your app for use in the SSW Rules Widget.   
See [SSW Rules - Do you store your secrets securely?](https://www.ssw.com.au/rules/store-your-secrets-securely/)

### Application Insights
The SSW Rules Widget requires application insights. Provide one to the `RulesWidget`
via the `appInsightsToken` parameter.

### Examples
```javascript
import { Widget } from 'ssw.rules.widget';

function ExamplePage() {
  return (
    <>
      /* Simplest implementation */
      <RulesWidget githubToken={tokenVariable} />

      /* Using all the options */
      <RulesWidget githubToken={tokenVariable} appInsightsToken={insightsTokenVariable} isDarkMode={true} numberOfRules={5} author={authorGitHubUsername} location={window.location}/>
    </>
  );
}
```

### Props
| Name | Type | Default | Required | Use |
|:---:|:---:|:---:|:---:|:---:|
| githubToken | string | null | Yes | GitHub personal access token used to retrieve data. |
| appInsightsToken | string | null | No | Application Insights token used to send logs and insights. |
| isDarkMode | boolean | null | No | Determines whether to show the widget in dark mode. When left blank, displays theme matching browser preferences, or light mode by default.  |
| numberOfRules | int | 10 | No | Number of rules to display in the widget. Must be a positive integer, or default will be used. |
| author | string | null | No | GitHub username of author to filter by. When set, the widget will show the most recent rules updated by the specified user. When left blank, the widget will show the most recent results for all rules. |
| location | object (Location) | null | No | When given a windows location the widget will determine if the url is the same as `ssw.com.au/rules` and won't link to itself. As per the [SSW Rule](https://www.ssw.com.au/rules/do-you-avoid-linking-a-page-to-itself)
