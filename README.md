# my-deprecations

[![Greenkeeper badge](https://badges.greenkeeper.io/freaktechnik/my-deprecations.svg)](https://greenkeeper.io/) [![Build Status](https://travis-ci.org/freaktechnik/my-deprecations.svg?branch=master)](https://travis-ci.org/freaktechnik/my-deprecations)

Command line utility to list deprecated package versions of a user with deprecation
message.

## Installation
```
npm install -g my-deprecations
```

## Usage
### CLI
```
$ my-deprecations <username>
```

Replace `<username>` with the npm user you want to get the deprecated packages for.
If no username is given it tries to use the logged in npm user.

Specify the `--verbose` parameter to list all versions, even if every version of
a package is deprecated.

### Module
```js
const myDeprecations = require("my-deprecations");

myDeprecations('username').then((deprecations, false) => {
    // ...
});
```

The main module exports a single function that resolves to an object with the
deprecations. The structure is as follows:
```json
{
    "packageName": {
        "version": "reason"
    },
    "fullyDeprecatedPackage": {
        "_allDeprecated": true
    }
}
```

If the second parameter is not set to true versions of packages with all versions
deprecated are omitted.

### License
This package is licensed under the MIT.
