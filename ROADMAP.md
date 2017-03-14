The following commands still need work before this module can become a "1.0" release:

# General stuff

* :question: Document all commands in README?

* :question: Create `man` pages for \*nix?

* :fire: Set up actual tests with ArangoDB 3.x (CI via travis/appveyor)

* :book: Document foxxignore format in-app (`foxx help foxxignore`?)

* :book: Document foxxrc format in-app (`foxx help foxxrc`?)

* :ship: Publish development release as `foxx-cli` on npm

* :fire: Verify flags/options are named & defined consistently (e.g. meaning of `force` and `verbose`)

# `foxx bundle`

* :book: Verbose description

* :book: Examples

* :question: Maybe rename "sloppy" (`-s`) to avoid confusion with "strict"/"stdout"/"save"/"safe"

* :question: Maybe rename "force" (`-f`) to clarify clobbering stdout

# `foxx config`

* :book: Verbose description

## `foxx config` (read)

* :sparkles: Pretty printing

## `foxx config` (write)

* :x: Read from stdin (`-`)

* :x: Read positional `k=v` args

* :x: PATCH mode

* :x: PUT mode (`-f`)

* :question: Maybe rename "force" (`-f`) to clarify "overwrite" mode

# `foxx deps`

* :book: Verbose description

## `foxx deps` (read)

* :sparkles: Pretty printing

## `foxx deps` (write)

* :x: Read from stdin (`-`)

* :x: Read positional `k=v` args

* :x: PATCH mode

* :x: PUT mode (`-f`)

* :question: Maybe rename "force" (`-f`) to clarify "overwrite" mode

# `foxx download`

* :book: Verbose description

* :question: Maybe rename "force" (`-f`) to distinguish between "overwrite" and "clobber stdout"

## `foxx download` (zip)

* :x: Implement actual functionality

## `foxx download` (extract)

* :x: Implement actual functionality

# `foxx ignore`

* :book: Verbose description

* :book: Examples

* :question: Maybe rename "force" (`-f`) to clarify "overwrite" mode

# `foxx info`

* :book: Examples

## `foxx info` (list)

* :rocket: All done!

## `foxx info` (detail)

* :sparkles: Pretty printing

# `foxx init`

* :book: Verbose description

* :book: Examples

## `foxx init` (interactive)

* :x: Actually generate files and folders

* :x: Implement example routes (`generateExamples`)

## `foxx init -y`

* :x: Define meaningful "verbose" defaults

## `foxx init -n`

* :x: Define meaningful "minimal defaults"

* :question: Maybe rename this to e.g. `-y --minimal`

# `foxx install`

* :book: Verbose description

* :sparkles: Pretty printing

* :fire: Make sure all examples work

# `foxx replace`

* :book: Verbose description

* :sparkles: Pretty printing

* :fire: Make sure all examples work

# `foxx script`

* :book: Verbose description

* :book: Examples

## `foxx script` (list)

* :rocket: All done!

## `foxx script` (run)

* :x: Implement actual functionality

* :x: Read positional `k=v` args

* :question: Maybe read args from stdin?

* :question: Pretty print?

# `foxx server`

* :question: Maybe rename ENV vars for consistency?

## `foxx server info`

* :book: Verbose description

* :book: Examples

* :question: Maybe rename "verbose" to distinguish secrets in detail / URLs in list

## `foxx server remove`

* :book: Verbose description

* :book: Examples

## `foxx server set`

* :book: Verbose description

# `foxx set-dev`

* :book: Verbose description

* :book: Examples

* :sparkles: Pretty printing?

# `foxx set-prod`

* :book: Verbose description

* :book: Examples

* :sparkles: Pretty printing?

# `foxx test`

* :book: Examples

* :question: Make compatible with mocha formatters?

* :question: Move xunit formatter into Foxx?

# `foxx uninstall`

* :book: Verbose description

* :book: Examples

* :sparkles: Pretty printing?

# `foxx upgrade`

* :book: Verbose description

* :sparkles: Pretty printing

* :fire: Make sure all examples work
