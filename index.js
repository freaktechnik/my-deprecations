"use strict";

const deprecations = require("deprecations"),
    userPackages = require("npm-user-packages");

/**
 * @param {string} username - User to load deprecated packages for.
 * @param {boolean} [showAllDeprecatedVersions=false] - Don't omit versions if
 *                  every version of the package is deprecated.
 * @async
 * @returns {Object} Package - versions - deprecation notice map.
 */
module.exports = (username, showAllDeprecatedVersions = false) => userPackages(username)
    .then((packages) => deprecations(...packages.map((p) => p.name)))
    .then((allPackages) => {
        // Filter packages & versions that aren't deprecated.
        for(const pkg in allPackages) {
            let hasDeprecated = false;
            let hasUndeprecated = false;
            for(const version in allPackages[pkg]) {
                if(allPackages[pkg][version] !== undefined) {
                    hasDeprecated = true;
                }
                else {
                    hasUndeprecated = true;
                    delete allPackages[pkg][version];
                }
            }
            if(!hasDeprecated) {
                delete allPackages[pkg];
            }
            else if(!hasUndeprecated && !showAllDeprecatedVersions) {
                allPackages[pkg] = {
                    _allDeprecated: true
                };
            }
        }

        return allPackages;
    });
