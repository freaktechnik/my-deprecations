"use strict";

const userPackages = require("npm-user-packages"),
    Listr = require("listr"),
    pacote = require("pacote"),

    getVersions = (moduleName) => pacote.packument(moduleName, {
        includeDeprecated: true
    }).then((res) => Object.values(res.versions));

module.exports = async () => new Listr([
    {
        title: "Get packages for user",
        task: async (ctx, task) => {
            task.title = `Get packages for user ${ctx.username}`;
            ctx.packages = await userPackages(ctx.username);
        }
    },
    {
        title: 'Get versions of packages',
        task: (ctx) => new Listr(ctx.packages.map((pkg) => ({
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
                    task: (depCtx) => depCtx.info[pkg.name].versions.forEach((version) => {
                        if(version.deprecated) {
                            if(!depCtx.info[pkg.name].deprecations) {
                                depCtx.info[pkg.name].deprecations = {};
                            }
                            depCtx.info[pkg.name].deprecations[version.version] = version.deprecated;
                        }
                        else {
                            depCtx.info[pkg.name].hasUndeprecated = true;
                        }
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
        })), {
            concurrent: true,
            clearOutput: true
        })
    }
]);
