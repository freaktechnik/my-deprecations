# my-deprecations

Command line utility to list deprecated package versions of a user with deprecation
message.

## Installation

```sh
npm install -g my-deprecations
```

## Usage

### CLI

```sh
my-deprecations <username>
```

Replace `<username>` with the npm user you want to get the deprecated packages for.
If no username is given it tries to use the logged in npm user.

Specify the `--verbose` parameter to list all versions, even if every version of
a package is deprecated.

### License

This package is licensed under the MIT.
