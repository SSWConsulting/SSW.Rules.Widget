# Contributing

## Required Tools

- Install nodejs via <https://nodejs.org/en/>

Currently built using node v20.9.0 and NPM v10.1.0

### Getting ready for development

- Clone the repo from <https://github.com/SSWConsulting/SSW.Rules.Widget>
- Run `npm install` to install packages
- Create a `.env` file with the variables from `.env.template` and replace placeholders with the actual values. If you add new variable, then don't forget to update the `.env.template`.

### Development

1. Branch off main for your PBI
2. Do your work
3. Run the site in development mode using `npm run dev`
4. Commit code and push
5. Raise a PR
6. Get it merged!

### Linking

#### NPM

1. In `ssw.rules.widget` run `npm link`
2. Go to the project you want to include the widget and run `npm link ssw.rules.widget`

#### Yarn (v4)

1. Go to the project you want to include the widget into and run `yarn link <path to widget> -A`

### Publishing to NPM

1. Update the version number. Run `npm version <patch|minor|major>`
2. Run `npm run build` to build the widget into the `dist` folder
3. Run `npm login` and enter the SSW account credentials (found in KeePass) to log in to NPM
4. Run `npm publish` to publish the build as a new version of the package

### Definition of Done

- Code Compiles
- Check the Acceptance Criteria.
- Code is squash-merged to main via a pull request that was approved by a 2nd developer.

> As per rule: [Done - Do you go beyond 'Done' and follow a 'Definition of Done'](https://rules.ssw.com.au/done-do-you-go-beyond-done-and-follow-a-definition-of-done)?

### Branches

- **main** is the main branch
- Always create a new branch for your PBIs
- Always delete your branch once your PR has been merged (GitHub should automatically do this)
