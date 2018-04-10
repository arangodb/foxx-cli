# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unpublished]

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
