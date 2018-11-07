# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2018-11-07

### Changed

* Server endpoint URLs are no longer pre-processed

  URLs are now handed over to arangojs unaltered to rely on arangojs' URL handling
  logic. When using URLs that include credentials or use the `ssl` and `tcp`
  alias protocols you may notice that the `server set` command no longer modifies
  these and the `.foxxrc` file contains the raw URLs.

  Note that when using URLs that include credentials the credentials will therefore
  be printed in plain text when the URL is displayed by a Foxx CLI command (e.g.
  `server show` and `server list`).

### Added

* Added support for unix socket URLs

  Unix socket URLs are now supported in the following formats:

  * `unix:///socket/path`
  * `http+unix:///socket/path` or `https+unix:///socket/path`
  * `http://unix:/socket/path` or `https://unix:/socket/path`
  * `tcp://unix:/socket/path` or `ssl://unix:/socket/path`

  Note that unix socket URLs can not include credentials.

### Fixed

* Authorization errors now show a prettier error message

  Previously authorization errors were not handled directly and would indicate
  a "Code: 11" ArangoError. Now these errors result in a more readable error
  message with suggestions for solving the problem.

## [1.2.0] - 2018-06-26

### Added

* Option `--password-file` (alias `-p`) reads the password from a file

  This is an alternative to `--password` which is interactive for security reasons.

## [1.1.3] - 2018-04-18

### Fixed

* Fixed `foxx init`: generateCrudRoutes is not defined (#27)

## [1.1.2] - 2018-04-11

### Fixed

* `foxx bundle` warning when outfile already exists now shows correct path

* `foxx init -i` only adds routers to `index.js` when generating CRUD routers

  This fixes a bug where defining collections without also generating CRUD routers
  would still result in the routers being referenced in `index.js` leading to a
  broken service.

* Foxx CLI now follows symlinks when generating the service bundle

## [1.1.1] - 2018-04-10

### Fixed

* Re-released on Linux to fix bad linebreaks in `foxx` CLI command

## [1.1.0] - 2018-04-10

### Added

* `foxx init` makes it easy to create boilerplate for a Foxx service.

* `foxx add` allows generating various JavaScript files:

  * `foxx add script` generates a script and adds it to the manifest

  * `foxx add test` generates a test suite

  * `foxx add router` generates a router and registers it in the main file

  * `foxx add crud` generates a CRUD router for a collection

## [1.0.1] - 2018-03-22

### Fixed

* HTTPS URLs are now resolved correctly

  Foxx CLI now uses the `request` module to download service sources locally.

## [1.0.0] - 2018-03-21

* Initial public release

[1.3.0]: https://github.com/arangodb/foxx-cli/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/arangodb/foxx-cli/compare/v1.1.3...v1.2.0
[1.1.3]: https://github.com/arangodb/foxx-cli/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/arangodb/foxx-cli/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/arangodb/foxx-cli/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/arangodb/foxx-cli/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/arangodb/foxx-cli/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/arangodb/foxx-cli/compare/v0.3.1...v1.0.0
