import userPackages from "npm-user-packages";
import Listr from "listr";
import pacote from "pacote";

const getVersions = async (moduleName) => {
    const result = await pacote.packument(moduleName, {
        includeDeprecated: true
    });
    return Object.values(result.versions);
};

export default async () => new Listr([
    {
        title: "Get packages for user",
        task: async (context, task) => {
            task.title = `Get packages for user ${context.username}`;
            const packages = await userPackages(context.username);
            context.packages = packages; // eslint-disable-line require-atomic-updates
        }
    },
    {
        title: 'Get versions of packages',
        task: (context) => new Listr(context.packages.map((package_) => ({
            title: package_.name,
            task: () => new Listr([
                {
                    title: `Get versions for ${package_.name}`,
                    task: async (packageContext) => {
                        packageContext.info[package_.name] = {
                            hasUndeprecated: false
                        };
                        packageContext.info[package_.name].versions = await getVersions(package_.name);
                    }
                },
                {
                    title: `Get deprecation messages for ${package_.name}`,
                    task: (depContext) => {
                        for(const version of depContext.info[package_.name].versions) {
                            if(version.deprecated) {
                                if(!depContext.info[package_.name].deprecations) {
                                    depContext.info[package_.name].deprecations = {};
                                }
                                depContext.info[package_.name].deprecations[version.version] = version.deprecated;
                            }
                            else {
                                depContext.info[package_.name].hasUndeprecated = true;
                            }
                        }
                    }
                },
                {
                    title: `Collect deprecations for ${package_.name}`,
                    task: (innerContext) => {
                        if(!innerContext.info[package_.name].hasUndeprecated && !innerContext.verbose) {
                            innerContext.info[package_.name] = {
                                _allDeprecated: true
                            };
                        }
                        else if(innerContext.info[package_.name].deprecations) {
                            innerContext.info[package_.name] = innerContext.info[package_.name].deprecations;
                        }
                        else {
                            delete innerContext.info[package_.name];
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
