# karma-failure-snapshots-mocha

[![NPM version](https://badge.fury.io/js/karma-failure-snapshots-mocha.png)](http://badge.fury.io/js/karma-failure-snapshots-mocha)
[![Dependency Status](https://david-dm.org/prantlf/karma-failure-snapshots-mocha.svg)](https://david-dm.org/prantlf/karma-failure-snapshots-mocha)
[![devDependency Status](https://david-dm.org/prantlf/karma-failure-snapshots-mocha/dev-status.svg)](https://david-dm.org/prantlf/karma-failure-snapshots-mocha#info=devDependencies)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[![NPM Downloads](https://nodei.co/npm/karma-failure-snapshots-mocha.png?downloads=true&stars=true)](https://www.npmjs.com/package/karma-failure-snapshots-mocha)

[Karma] plugin for taking snapshots of the web browser state whenever a [Mocha] test fails.

If your tests fail in an environment, which is difficult to debug, or if they do not fail during debugging, or if they fail intermittently, this plugin may help you to investigate the problem.

This is a unit test framework extension for the [karma-failure-snapshots] plugin. You will find more information about the failure snapshots there.

### Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Writing Tests](#writing-tests)
- [Contributing](#contributing)
- [Release History](#release-history)
- [License](#license)

## Installation

Make sure, that you have installed [Node.js] 8 or newer. Then you can install this plugin by [NPM] or [Yarn]:

    npm install --save-debug karma-failure-snapshots-mocha

Usually you will install this plugin together with `karma` itself and `Mocha`. For example, the typical installation:

    npm install --save-debug karma karma-mocha karma-chai mocha chai
        karma-chrome-launcher karma-firefox-launcher \
        karma-failure-snapshots karma-failure-snapshots-mocha

See an [example] how to introduce tests with failure snapshots in a project.

## Configuration

This plugin has to be aded to the `frameworks` array in the Karma configuration file, usually `karma.conf.js`:

    frameworks: [ 'failure-snapshots-mocha', ... ],

You will add it with the main plugin, which you will place in back of it. When you add the `Mocha` framework plugin, make sure, that you *place the failure snapshot plugins before it*. For example, a typical configuration:

    module.exports = function (config) {
      config.set({
        frameworks: [
          'failure-snapshots-mocha', 'failure-snapshots', 'mocha', 'chai'
        ],
        ...
      })
    }

See the [common plugin options] for more information about the customization and the [main plugin configuration] for more information.


## Writing Tests

Usually you will not need to modify your tests. The snapshots will just be taken, once a test spec fails or throws an unexpected error. For example, a typical test using set-up and tear-down phases:

    describe('test suite', function () {
      before(function () {
        // Render a component in the document body
      })

      after(function () {
        // Clean up the document body
      })

      it('test spec 1', function () {
        ...
      })

      ...
    })

The automatic snapshot taking is using the `afterEach` hook in the top test suite. If you implement this hook and perform a page clean-up, which would remove content important for inspection, the snapshot will be taken after your clean-up and thus not be useful:

    describe('test suite', function () {
      beforeEach(function () {
        // Render a component in the document body
      })

      afterEach(function () {
        // Clean up the document body
      })

      it('test spec 1', function () {
        ...
      })

      ...
    })

If you have such clean-up, insert an additional `afterEach` hook before the clean-up, which will make the snapshot of the problem:

    describe('test suite', function () {
      beforeEach(function () {
        // Render a component in the document body
      })

      // Ensure that a snapshot is taken immediately in case of failure
      afterEach(window.ensureFailureSnapshot)

      afterEach(function () {
        // Clean up the document body
      })

      it('test spec 1', function () {
        ...
      })

      ...
    })

The `ensureFailureSnapshot` will take a failure snapshot only if there is a failure. If there is no failure, this function will return without doing anything.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.  Add unit tests for any new or changed functionality. Lint and test your code using Grunt.

## Release History

* 2019-07-15   v0.0.1   Initial release

## License

Copyright (c) 2019-2022 Ferdinand Prantl

Licensed under the MIT license.

[karma-failure-snapshots]: https://github.com/prantlf/karma-failure-snapshots#readme
[Node.js]: https://nodejs.org/
[NPM]: https://www.npmjs.com/get-npm
[Yarn]: https://yarnpkg.com/lang/en/docs/install/
[Karma]: https://karma-runner.github.io/
[Mocha]: https://mochajs.org/
[common plugin options]: https://github.com/prantlf/karma-failure-snapshots#configuration
[main plugin configuration]: https://github.com/prantlf/karma-failure-snapshots#options
