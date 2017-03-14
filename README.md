# foxx-cli

[![license - APACHE-2.0](https://img.shields.io/npm/l/foxx-cli.svg?style=flat-square)](http://opensource.org/licenses/APACHE-2.0)
[![Dependencies](https://img.shields.io/david/arangodb/foxx-cli.svg?style=flat-square)](https://david-dm.org/arangodb/foxx-cli)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

[![NPM status](https://nodei.co/npm/foxx-cli.png?downloads=true&stars=true)](https://npmjs.org/package/foxx-cli)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

> CLI for managing and developing ArangoDB Foxx services.

**foxx-cli** is a standalone tool for the shell that can be used to talk to [ArangoDB](https://www.arangodb.com) servers to manage [Foxx services](https://foxx.arangodb.com).

To learn more about Foxx, see the [official ArangoDB Foxx documentation](https://docs.arangodb.com/3/Manual/Foxx/).

**NOTE: foxx-cli is not yet production ready nor available on npm. The documentation is currently full of lies. Please come back later. For details see [the project roadmap](./ROADMAP.md)**

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Special files](#special-files)
  - [manifest.json](#manifestjson)
  - [foxxignore](#foxxignore)
  - [foxxrc](#foxxrc)
- [Contribute](#contribute)
- [License](#license)

## Install

**foxx-cli** runs on [Node.js](https://nodejs.org) and can be installed with [yarn](https://yarnpkg.com):

```
$ yarn global add foxx-cli
```

Or with [npm](https://www.npmjs.com):

```
$ npm install --global foxx-cli
```


**Note**: on Linux systems you may need to install the package with elevated privileges, i.e. using `sudo`:

```
$ sudo npm install --global foxx-cli
```

## Usage

After you've installed **foxx-cli**, you should be able to use the `foxx` program. You can learn more about the different commands `foxx` supports by using the `help` command.

```
$ foxx help
```

You can also invoke the `help` command with the names of other commands to learn more about them, e.g.:

```
$ foxx help install # Help for the "install" command

$ foxx help server # Help for the "server" command

$ foxx help server list # Subcommands are supported, too
```

If you have no prior knowledge of Foxx, you can get started by [installing ArangoDB locally](https://www.arangodb.com/download) and then creating a new Foxx service in the current directory using the `init` command:

```
$ foxx init # answer the interactive questions
```

If you just want an example, you can also run the `init` command non-interactively:

```
$ foxx init -y # just create an example service please
```

You can also use `foxx init -n` to create a minimal service without the example code.

You can inspect the files created by the program and tweak them as necessary. Once you're ready, install the service at a *mount path* using the `install` command:

```
$ foxx install /hello-foxx # installs the current directory
```

You should then be able to view the installed service in your browser at the following URL:

http://localhost:8529/_db/_system/hello-foxx

## Special files

### manifest.json

The `manifest.json` or manifest file contains a service's meta-information. For more information on the manifest format, see the [official ArangoDB documentation](https://docs.arangodb.com/3/Manual/Foxx/Manifest.html).

The directory containing a service's `manifest.json` file is called the *root directory* of the service.

### foxxignore

If you want to exclude files from the service bundle that will uploaded to ArangoDB you can create a file called `.foxxignore` in the root directory of your service. Each line should specify one pattern you wish to ignore:

* Patterns starting with `!` will be treated as an explicit whitelist. Paths matching these patterns will not be ignored even if they would match any of the other patterns.

  **Example**: `!index.js` will override any pattern matching a file called `index.js`.

* Patterns starting with `/` will only match paths relative to the service's root directory.

  **Example**: `/package.json` will not match `node_modules/joi/package.json`.

* Patterns ending with `/` will match a directory and any files inside of it.

  **Example**: `node_modules/` will exclude all `node_modules` directories and all of their contents.

* A single `*` (glob) will match zero or more characters (even dots) in a file or directory name.

  **Example**: `.*` will match any files and directories with a name starting with a dot.

* A double `**` (globstar) will match zero or more levels of nesting.

  **Example**: `hello/**/world` will match `hello/world`, `hello/foo/world`, `hello/foo/bar/world`, and so on.

* Patterns starting with `#` are considered comments and will be ignored.

For more details on the pattern matching behaviour, see the documentation of the [minimatch](https://www.npmjs.com/package/minimatch) module (with the `dot` flag enabled).

If no `.foxxignore` file is present in the service's root directory the following patterns will be ignored automatically: `.git/`, `.svn/`, `.hg/`, `*.swp`, `.DS_Store`.

Should you need to include files that match these patterns for some reason, you can override this list by creating an empty `.foxxignore` file.

You can also create a `.foxxignore` file in the current directory using the `ignore` command:

```
$ foxx ignore # creates a file pre-populated with the defaults

$ foxx ignore --force # creates an empty file
```

To add individual patterns to the `.foxxignore` file just pass them as additional arguments:

```
$ foxx ignore .git/ .svn/ # you can pass multiple patterns at once

$ foxx ignore \*.swp # make sure to escape special characters
```

### foxxrc

If you define servers using the `server` commands, a `.foxxrc` file will be created in your `$HOME` directory, which is typically one of the following paths:

* `/home/$USER` on Linux

* `/Users/$USER` on macOS

* `C:\Users\$USER` on Windows

This file contains sections for each server which may contain server credentials should you decide to save them.

## Contribute

Feel free to dive in! [Open an issue](https://github.com/arangodb/foxx-cli/issues/new) or submit PRs.

All JavaScript code should conform to [standard](http://standardjs.com) coding style.

This README conforms to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

The Apache License, Version 2.0. For more information, see the accompanying LICENSE file.
