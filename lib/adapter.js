/* global Mocha, mocha, afterEach */

(function () {
  'use strict'

  var failureSnapshots = window.__failure_snapshots__
  var config = window.__karma__.config.failureSnapshots || {}
  var includePassed = config.includePassed
  var hideFunctionsFrom = config.hideFunctionsFrom || [
    'mocha.js', 'chai.js', 'expect.js', 'should.js', 'unexpected.js'
  ]
  var earlySnapshot
  var currentSpec

  function formatDescription (spec) {
    return spec.fullTitle()
  }

  window.ensureFailureSnapshot = function () {
    if (currentSpec.isFailed() || includePassed) {
      return failureSnapshots
        .takeFailureSnapshot()
        .then(function (output) {
          earlySnapshot = output
        })
        .catch(function (error) {
          console.log('Taking the failure snapshot failed:')
          console.log(' ', formatDescription(currentSpec))
          console.error(error)
        })
    }
    return Promise.resolve()
  }

  var Reporter = mocha._reporter
  var reporterOptions = mocha.options.reporterOptions

  function SpecFollower (runner) {
    runner.on(Mocha.Runner.constants.EVENT_TEST_BEGIN, function (spec) {
      currentSpec = spec
      earlySnapshot = undefined
    })
    new Reporter(runner, reporterOptions) // eslint-disable-line no-new
  }

  mocha.reporter(SpecFollower)

  function processFailure (done) {
    var failure = currentSpec.isFailed()
    if (failure || includePassed) {
      var firstFailure = currentSpec.$errors[0] ||
        currentSpec.$assertionErrors[0] || {}
      var stack
      if (typeof firstFailure === 'string') {
        stack = firstFailure
      } else {
        var message = firstFailure.message || 'Unknown.'
        stack = firstFailure.stack || ''
        if (stack.indexOf(message) < 0) {
          stack = stack ? message + '\n' + stack : message
        }
      }
      failureSnapshots.collectFailureSnapshot({
        description: formatDescription(currentSpec),
        stack: stack,
        failure: failure,
        pass: currentSpec.isPassed(),
        earlySnapshot: earlySnapshot,
        hideFunctionsFrom: hideFunctionsFrom
      }, done)
    } else {
      done()
    }
  }

  afterEach(processFailure)
})()
