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

### Examples
```javascript
import { Widget } from 'ssw.rules.widget';

function ExamplePage() {
  return (
    <>
      /* Simplest implementation */
      <Widget token={tokenVariable} />

      /* Using all the options */
      <Widget token={tokenVariable} isDarkMode={true} numberOfRules={5} author={authorGitHubUsername} />
    </>
  );
}
```

### Props
| Name | Type | Default | Required | Use |
|:---:|:---:|:---:|:---:|:---:|
| token | string | null | Yes | GitHub personal access token used to retrieve data. |
| isDarkMode | boolean | null | No | Determines whether to show the widget in dark mode. When left blank, displays theme matching browser preferences, or light mode by default.  |
| numberOfRules | int | 10 | No | Number of rules to display in the widget. Must be a positive integer, or default will be used. |
| author | string | null | No | GitHub username of author to filter by. When set, the widget will show the most recent rules updated by the specified user. When left blank, the widget will show the most recent results for all rules. |

## Contributing

### Required Tools
- Install nodejs via https://nodejs.org/en/
- Install yarn via https://classic.yarnpkg.com/en/

Currently built using node v14.15.4 and NPM v7.18.1

### Getting ready for development
- Clone the repo from https://github.com/SSWConsulting/SSW.Rules.Widget
- Run `yarn install` to install packages
- Create a GitHub personal access token as per instructions
- Create a `.env` file with the following variable:
`REACT_APP_GITHUB_PAT: <PERSONAL ACCESS TOKEN>`

### Development
1. Branch off main for your PBI
2. Do your work
3. Run the site in development mode using `yarn start`
4. Commit code and push
5. Raise a PR
6. Get it merged!

### Publishing to NPM
- Update the version number in `package.json`
- Run `yarn build` to build the widget into the `dist` folder
- Run `npm login` and enter the SSW account credentials (found in KeePass) to log in to NPM
- Run `npm publish` to publish the build as a new version of the package

### Definition of Done

- Code Compiles
- Check the Acceptance Criteria.
- Code is squash-merged to main via a pull request that was approved by a 2nd developer.
> <As per rule: [Done - Do you go beyond 'Done' and follow a 'Definition of Done'](https://rules.ssw.com.au/done-do-you-go-beyond-done-and-follow-a-definition-of-done)?>

### Branches
- **main** is the main branch
- Always create a new branch for your PBIs 
- Always delete your branch once your PR has been merged
