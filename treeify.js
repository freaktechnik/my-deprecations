"use strict";

module.exports = (deprecatedPakages, username) => {
    const tree = {
        label: `Deprecated packages of ${username}`,
        nodes: []
    };
    for(const pkg in deprecatedPakages) {
        const node = {
            label: pkg,
            leaf: {}
        };
        for(const version in deprecatedPakages[pkg]) {
            node.leaf[version] = deprecatedPakages[pkg][version];
        }
        tree.nodes.push(node);
    }
    return tree;
};
