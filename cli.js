#!/usr/bin/env node

import meow from "meow";
import myDeprecations from './index.js';
import Listr from "listr";
import execa from "execa";
import buildTree from "pretty-tree";
import formatTree from "./treeify.js";
import chalk from "chalk";
const ARG_COUNT = 1,
    FIRST = 0,
    cli = meow(`
    Usage
        $ my-deprecations [username]

        <username> defaults to the logged in npm user.

    Options
        -v, --verbose  Show all deprecated versions
        --help         This help output
        --version      Version of the tool

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
`,
    {
        importMeta: import.meta,
        flags: {
            verbose: {
                type: "boolean",
                alias: "v"
            }
        }
    }),
    tasks = new Listr([
        {
            title: "Get username",
            enabled: (context) => !context.username,
            task: async (context) => {
                const { stdout } = await execa('npm', [ 'whoami' ]);
                context.username = stdout;
            }
        },
        {
            title: "Get deprecations",
            task: async (context, task) => myDeprecations(context.username.trim(), context.verbose, task)
        },
        {
            title: "Build nice tree",
            task: (context) => {
                context.tree = buildTree(formatTree(context.info, context.username));
            }
        }
    ]);

if(cli.input.length > ARG_COUNT) {
    const ERROR = 1;
    process.stdout.write(chalk.red("Should specify at most one username.\n"));
    cli.showHelp(ERROR);
}
else {
    tasks.run({
        username: cli.input[FIRST],
        verbose: cli.flags.verbose,
        info: {}
    })
        .then((context) => {
            process.stdout.write(context.tree);
        })
        .catch(console.error);
}
