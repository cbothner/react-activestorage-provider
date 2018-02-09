# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

* Parses the server response as JSON automatically and calls `onSubmit` with the contents of the response body
* Uses `Accept: 'application/json'` so you don’t need to end `endpoint.path` with `.json`

## 0.0.1 — 2018-02-09

### Added

* A component that handles the direct upload of a file to an ActiveStorage service and calls render props with arguments that let you build your own upload widget.

[unreleased]: https://github.com/cbothner/react-activestorage-provider/compare/v0.0.1...HEAD
