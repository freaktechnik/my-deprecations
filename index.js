"use strict";

const execa = require("execa"),
    userPackages = require("npm-user-packages"),
    Listr = require("listr"),

    getVersions = (moduleName) => execa.stdout('npm', [
        'info',
        moduleName,
        'versions',
        '--json',
        '--silent',
        '--no-spin'
    ])
        .then((res) => JSON.parse(res)),
    getDeprecationMessage = (moduleName, version) => execa.stdout('npm', [
        'info',
        `${moduleName}@${version}`,
        'deprecated',
        '--json',
        '--silent',
        '--no-spin'
    ])
        .then((res) => {
            if(!res) {
                return undefined;
            }
            return JSON.parse(res)
        });

module.exports = async () => {
    return new Listr([
        {
            title: "Get packages for user",
            task: async (ctx, task) => {
                task.title = `Get packages for user ${ctx.username}`;
                ctx.packages = await userPackages(ctx.username);
            }
        },
        {
            title: 'Get versions of packages',
            task: (ctx) => new Listr(ctx.packages.map((pkg) => {
                return {
                    title: pkg.name,
                    task: () => new Listr([
                        {
                            title: `Get versions for ${pkg.name}`,
                            task: async (pkgCtx) => {
                                pkgCtx.info[pkg.name] = {
                                    hasUndeprecated: false
                                };
                                pkgCtx.info[pkg.name].versions = await getVersions(pkg.name);
                            }
                        },
                        {
                            title: `Get deprecation messages for ${pkg.name}`,
                            task: (depCtx) => new Listr(depCtx.info[pkg.name].versions.map((version) => {
                                return {
                                    title: `Get deprecation message for ${pkg.name}@${version}`,
                                    task: async (innerCtx) => {
                                        const deprecationMessage = await getDeprecationMessage(pkg.name, version);
                                        if(deprecationMessage && deprecationMessage.length) {
                                            if(!innerCtx.info[pkg.name].deprecations) {
                                                innerCtx.info[pkg.name].deprecations = {};
                                            }
                                            innerCtx.info[pkg.name].deprecations[version] = deprecationMessage;
                                        }
                                        else {
                                            innerCtx.info[pkg.name].hasUndeprecated = true;
                                        }
                                    }
                                };
                            }), {
                                collapse: true,
                                clearOutput: true
                            })
                        },
                        {
                            title: `Collect deprecations for ${pkg.name}`,
                            task: (innerCtx) => {
                                if(!innerCtx.info[pkg.name].hasUndeprecated && !innerCtx.verbose) {
                                    innerCtx.info[pkg.name] = {
                                        _allDeprecated: true
                                    };
                                }
                                else if(!innerCtx.info[pkg.name].deprecations) {
                                    delete innerCtx.info[pkg.name];
                                }
                                else {
                                    innerCtx.info[pkg.name] = innerCtx.info[pkg.name].deprecations;
                                }
                            }
                        }
                    ], {
                        showSubtasks: false
                    })
                };
            }), {
                concurrent: true,
                clearOutput: true
            })
        }
    ]);
};
