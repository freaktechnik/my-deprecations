import userPackages from "npm-user-packages";
import { Listr } from "listr2";
import pacote from "pacote";

const getVersions = async (moduleName) => {
    const result = await pacote.packument(moduleName, {
        includeDeprecated: true,
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
        },
    },
    {
        title: 'Get versions of packages',
        task: (context, task) => task.newListr(context.packages.map((package_) => ({
            title: package_.name,
            task: (taskContext, packageTask) => packageTask.newListr([
                {
                    title: `Get versions for ${package_.name}`,
                    task: async () => {
                        context.info[package_.name] = {
                            hasUndeprecated: false,
                            versions: await getVersions(package_.name),
                        };
                    },
                },
                {
                    title: `Get deprecation messages for ${package_.name}`,
                    task: () => {
                        for(const version of context.info[package_.name].versions) {
                            if(version.deprecated) {
                                if(!context.info[package_.name].deprecations) {
                                    context.info[package_.name].deprecations = {};
                                }
                                context.info[package_.name].deprecations[version.version] = version.deprecated;
                            }
                            else {
                                context.info[package_.name].hasUndeprecated = true;
                            }
                        }
                    },
                },
                {
                    title: `Collect deprecations for ${package_.name}`,
                    task: () => {
                        if(!context.info[package_.name].hasUndeprecated && !context.verbose) {
                            context.info[package_.name] = {
                                _allDeprecated: true,
                            };
                        }
                        else if(context.info[package_.name].deprecations) {
                            context.info[package_.name] = context.info[package_.name].deprecations;
                        }
                        else {
                            delete context.info[package_.name];
                        }
                    },
                },
            ], {
                showSubtasks: false,
                concurrent: false,
            }),
        })), {
            concurrent: true,
            clearOutput: true,
        }),
    },
]);
