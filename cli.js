#!/usr/bin/env node
"use strict";

/* eslint-disable promise/catch-or-return */
const meow = require("meow"),
    myDeprecations = require("./index"),
    ora = require("ora"),
    buildTree = require("pretty-tree"),
    formatTree = require("./treeify"),
    chalk = require("chalk"),
    ARG_COUNT = 1,
    cli = meow(`
    Usage
        $ my-deprecations <username>

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
    alias: {
        v: 'verbose'
    }
});

if(cli.input.length != ARG_COUNT) {
    process.stdout.write(chalk.red("Should specify exactly one username.\n"));
    cli.showHelp(1);
}

const [ username ] = cli.input,
    deprecations = myDeprecations(username.trim(), cli.flags.verbose);
ora.promise(deprecations, `Getting deprecations for ${username}`);

deprecations.then((info) => {
    const spinner = ora('Building nice tree').start(),
        tree = buildTree(formatTree(info, username));
    spinner.succeed();
    process.stdout.write(tree);
});
/* eslint-enable promise/catch-or-return */
