# Roadmap to 1.0.0

The following still needs work before this module can become a "1.0" release:

## General stuff

* :question: Document all commands in README?
* :question: Create `man` pages for \*nix?
* :fire: Set up actual tests with ArangoDB 3.x (CI via travis/appveyor)
* :book: Document foxxignore format in-app (`help foxxignore`?)
* :book: Document foxxrc format in-app (`help foxxrc`?)
* :ship: Publish development release as `foxx-cli` on npm

## :x: Functionality

### `init`

* Actually generate files and folders
* Implement example routes (`generateExamples`)
* Define meaningful "minimal" defaults
* Define meaningful "full" defaults

## :book: Need examples

* `bundle`
* `ignore`
* `init`
* `run`
* `scripts`
* `server list`
* `server remove`
* `server show`
* `set-dev`
* `set-prod`
* `test`
* `uninstall`

## :book: Need long description

* `bundle`
* `config`
* `deps`
* `download`
* `ignore`
* `init`
* `install`
* `replace`
* `run`
* `scripts`
* `server list`
* `server remove`
* `server set`
* `server show`
* `set-dev`
* `set-prod`
* `uninstall`
* `upgrade`

## :sparkles: Need pretty printing

* `config`
* `deps`
* `install`
* `replace`
* `run`
* `set-dev`
* `set-prod`
* `show`
* `upgrade`

## :question: Technical decisions

### `server`

* Maybe rename ENV vars for consistency?

### `test`

* Make compatible with mocha formatters?

  This would require recording events during the test run, serialising them and
  deserialising them in foxx-cli to play them back to the 3rd party reporter.
  This may not be worth the effort considering xunit and tap are already fairly
  versatile.
