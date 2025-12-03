/**
 * Formats deprecated package info as a pretty-tree structure.
 *
 * @param {object} deprecatedPakages - Deprecated package info.
 * @param {string} username - Name of the user the deprecated packages are of.
 * @returns {object} Tree strucutre for pretty-tree.
 */
export default (deprecatedPakages, username) => {
    const tree = {
        label: `Deprecated packages of ${username}`,
        nodes: [],
        leaf: {},
    };
    let addedLeaf = false;
    for(const [
        packageName,
        packageDetails,
    ] of Object.entries(deprecatedPakages)) {
        const node = {
            label: packageName,
            leaf: {},
        };
        if(packageDetails._allDeprecated) {
            tree.leaf[packageName] = '(all versions)';
            addedLeaf = true;
        }
        else {
            for(const [
                version,
                versionDetails,
            ] of Object.entries(packageDetails)) {
                node.leaf[version] = versionDetails;
            }
            tree.nodes.push(node);
        }
    }
    if(!addedLeaf) {
        delete tree.leaf;
    }
    return tree;
};
