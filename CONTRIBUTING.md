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
1. Update the version number in `package.json`
1. Run `yarn build` to build the widget into the `dist` folder
1. Run `npm login` and enter the SSW account credentials (found in KeePass) to log in to NPM
1. Run `npm publish` to publish the build as a new version of the package

### Definition of Done

- Code Compiles
- Check the Acceptance Criteria.
- Code is squash-merged to main via a pull request that was approved by a 2nd developer.
> As per rule: [Done - Do you go beyond 'Done' and follow a 'Definition of Done'](https://rules.ssw.com.au/done-do-you-go-beyond-done-and-follow-a-definition-of-done)?

### Branches
- **main** is the main branch
- Always create a new branch for your PBIs 
- Always delete your branch once your PR has been merged (GitHub should automatically do this)
