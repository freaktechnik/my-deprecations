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
        leaf: {}
    };
    let addedLeaf = false;
    for(const package_ in deprecatedPakages) {
        const node = {
            label: package_,
            leaf: {}
        };
        if(deprecatedPakages[package_]._allDeprecated) {
            tree.leaf[package_] = '(all versions)';
            addedLeaf = true;
        }
        else {
            for(const version in deprecatedPakages[package_]) {
                node.leaf[version] = deprecatedPakages[package_][version];
            }
            tree.nodes.push(node);
        }
    }
    if(!addedLeaf) {
        delete tree.leaf;
    }
    return tree;
};
