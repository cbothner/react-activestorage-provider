# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

* Correctly send multiple blob ids for multiple attachments.

## [0.1.0] — 2018-04-27

### Added

* Allows host to be configured, since some apps host their front-end on a different server than their API. Thanks, @derigible

## [0.0.3] — 2018-02-12

### Changed

* Exports flow types so you can import them

## [0.0.2] — 2018-02-09

### Changed

* Parses the server response as JSON automatically and calls `onSubmit` with the contents of the response body
* Uses `Accept: 'application/json'` so you don’t need to end `endpoint.path` with `.json`

## 0.0.1 — 2018-02-09

### Added

* A component that handles the direct upload of a file to an ActiveStorage service and calls render props with arguments that let you build your own upload widget.

[unreleased]: https://github.com/cbothner/react-activestorage-provider/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/cbothner/react-activestorage-provider/compare/v0.0.3...v0.1.0
[0.0.3]: https://github.com/cbothner/react-activestorage-provider/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/cbothner/react-activestorage-provider/compare/v0.0.1...v0.0.2
