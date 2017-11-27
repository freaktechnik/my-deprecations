#!/usr/bin/env node
"use strict";

const meow = require("meow"),
    myDeprecations = require("./index"),
    ora = require("ora"),
    buildTree = require("pretty-tree"),
    formatTree = require("./treeify"),
    chalk = require("chalk"),
    npmWhoami = require("npm-whoami"),
    ARG_COUNT = 1,
    cli = meow(`
    Usage
        $ my-deprecations [username]

        <username> defaults to the logged in npm user.

    Options
        -v, --verbose  Show all deprecated versions

    Examples
        $ my-deprecations freaktechnik
        ✔ Getting deprecations for freaktechnik
        ✔ Building nice tree
        Deprecated packages of freaktechnik
        ├─┬ eslint-plugin-freaktechnik
        │ ├── 1.0.0:  Use @freaktechnik eslint configs directly
        │ └── 1.0.1:  Use @freaktechnik eslint configs directly
        └─┬ webapp-validator-central
          ├── 3.1.0: Checks an outdated webapp spec
          └── 3.1.1: Checks an outdated webapp spec

        $my-deprecations freaktechnik --verbose
        ✔ Getting deprecations for freaktechnik
        ✔ Building nice tree
        Deprecated packages of freaktechnik
        ├─┬ eslint-plugin-freaktechnik
        │ ├── 1.0.0:  Use @freaktechnik eslint configs directly
        │ └── 1.0.1:  Use @freaktechnik eslint configs directly
        ├── grunt-webapp:               (all deprecated)
        ├── grunt-validate-webapp:      (all deprecated)
        ├── grunt-marketplace:          (all deprecated)
        ├── requestmod:                 (all deprecated)
        ├── jetpack-twitchbots:         (all deprecated)
        ├── jetpack-homepanel:          (all deprecated)
        ├── get-fennec:                 (all deprecated)
        ├── preferences-utils:          (all deprecated)
        ├── jetpack-panelview:          (all deprecated)
        ├── fx-marketplace-publish:     (all deprecated)
        ├── istanbul-jpm:               (all deprecated)
        └─┬ webapp-validator-central
          ├── 3.1.0: Checks an outdated webapp spec
          └── 3.1.1: Checks an outdated webapp spec
`, {
            flags: {
                verbose: {
                    type: "boolean",
                    alias: "v"
                }
            }
        });

if(cli.input.length > ARG_COUNT) {
    const ERROR = 1;
    process.stdout.write(chalk.red("Should specify at most one username.\n"));
    cli.showHelp(ERROR);
}

let username;
if(!cli.input.length) {
    username = new Promise((resolve, reject) => {
        npmWhoami((err, user) => {
            if(err) {
                reject(err);
            }
            else {
                resolve(user);
            }
        });
    });
    ora.promise(username, 'Getting username');
}
else {
    const [ u ] = cli.input;
    username = Promise.resolve(u);
}

(async () => {
    const user = await username,
        deprecations = myDeprecations(user.trim(), cli.flags.verbose);
    ora.promise(deprecations, `Getting deprecations for ${user}`);

    const info = await deprecations,
        spinner = ora('Building nice tree').start(),
        tree = buildTree(formatTree(info, user));
    spinner.succeed();
    process.stdout.write(tree);
})();
