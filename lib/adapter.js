/* global Mocha, mocha, afterEach */

(function () {
  'use strict'

  const failureSnapshots = window.__failure_snapshots__
  const config = window.__karma__.config.failureSnapshots || {}
  const includePassed = config.includePassed
  const hideFunctionsFrom = config.hideFunctionsFrom || [
    'mocha.js', 'chai.js', 'expect.js', 'should.js', 'unexpected.js'
  ]
  let earlySnapshot
  let currentSpec

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

  const Reporter = mocha._reporter
  const reporterOptions = mocha.options.reporterOptions

  function SpecFollower (runner) {
    runner.on(Mocha.Runner.constants.EVENT_TEST_BEGIN, function (spec) {
      currentSpec = spec
      earlySnapshot = undefined
    })
    new Reporter(runner, reporterOptions) // eslint-disable-line no-new
  }

  mocha.reporter(SpecFollower)

  function processFailure (done) {
    const failure = currentSpec.isFailed()
    if (failure || includePassed) {
      const firstFailure = currentSpec.$errors[0] ||
        currentSpec.$assertionErrors[0] || {}
      let stack
      if (typeof firstFailure === 'string') {
        stack = firstFailure
      } else {
        const message = firstFailure.message || 'Unknown.'
        stack = firstFailure.stack || ''
        if (stack.indexOf(message) < 0) {
          stack = stack ? message + '\n' + stack : message
        }
      }
      failureSnapshots.collectFailureSnapshot({
        description: formatDescription(currentSpec),
        stack,
        failure,
        pass: currentSpec.isPassed(),
        earlySnapshot,
        hideFunctionsFrom
      }, done)
    } else {
      done()
    }
  }

  afterEach(processFailure)
})()
