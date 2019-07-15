const { join } = require('path')

function createPattern (path) {
  return {
    pattern: path,
    included: true,
    served: true,
    watched: false
  }
}

function framework (files) {
  files.unshift(createPattern(join(__dirname, 'adapter.js')))
}

framework.$inject = ['config.files']

module.exports = {
  'framework:failure-snapshots-mocha': ['factory', framework]
}
