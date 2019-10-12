"use strict";

/**
 * Formats deprecated package info as a pretty-tree structure.
 *
 * @param {object} deprecatedPakages - Deprecated package info.
 * @param {string} username - Name of the user the deprecated packages are of.
 * @returns {object} Tree strucutre for pretty-tree.
 */
module.exports = (deprecatedPakages, username) => {
    const tree = {
        label: `Deprecated packages of ${username}`,
        nodes: [],
        leaf: {}
    };
    let addedLeaf = false;
    for(const pkg in deprecatedPakages) {
        const node = {
            label: pkg,
            leaf: {}
        };
        if(deprecatedPakages[pkg]._allDeprecated) {
            tree.leaf[pkg] = '(all versions)';
            addedLeaf = true;
        }
        else {
            for(const version in deprecatedPakages[pkg]) {
                node.leaf[version] = deprecatedPakages[pkg][version];
            }
            tree.nodes.push(node);
        }
    }
    if(!addedLeaf) {
        delete tree.leaf;
    }
    return tree;
};
