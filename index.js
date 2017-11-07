"use strict";

const deprecations = require("deprecations"),
    userPackages = require("npm-user-packages");

module.exports = (username) => userPackages(username)
    .then((packages) => deprecations(...packages.map((p) => p.name)))
    .then((allPackages) => {
        // Filter packages & versions that aren't deprecated.
        for(const pkg in allPackages) {
            let hasDeprecated = false;
            for(const version in allPackages[pkg]) {
                if(allPackages[pkg][version] !== undefined) {
                    hasDeprecated = true;
                }
                else {
                    delete allPackages[pkg][version];
                }
            }
            if(!hasDeprecated) {
                delete allPackages[pkg];
            }
        }

        return allPackages;
    });
