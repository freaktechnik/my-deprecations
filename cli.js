#!/usr/bin/env node
"use strict";

/* eslint-disable promise/catch-or-return */
const meow = require("meow"),
    myDeprecations = require("./index"),
    ora = require("ora"),
    buildTree = require("pretty-tree"),
    formatTree = require("./treeify"),
    ARG_COUNT = 1,
    cli = meow(`
    Usage
        $ my-deprecations <username>

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
`);

if(cli.input.length != ARG_COUNT) {
    throw new Error("Should specify exactly one username");
}

const [ username ] = cli.input,
    deprecations = myDeprecations(username.trim());
ora.promise(deprecations, `Getting deprecations for ${username}`);

deprecations.then((info) => {
    const spinner = ora('Building nice tree').start(),
        tree = buildTree(formatTree(info, username));
    spinner.succeed();
    process.stdout.write(tree);
});
/* eslint-enable promise/catch-or-return */
