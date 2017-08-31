#!/usr/bin/env node

'use strict'

const R = require('ramda')
const is = require('check-more-types')
const join = require('path').join
const debug = require('debug')('locha')
const { objectFromString } = require('../src/utils')
const locha = require('..')
const minimist = require('minimist')
const mochaUtils = require('mocha').utils

const getMochaOpts = require('mocha/bin/options')
// If not already done, load mocha.opts
if (!process.env.LOADED_MOCHA_OPTS) {
  debug('argv before possible --opts')
  debug(process.argv.slice(2))
  getMochaOpts()
  debug('after')
  debug(process.argv.slice(2))
}

const argv = minimist(process.argv.slice(2), {
  string: ['env', 'compilers', 'require', 'reporter', 'opts'],
  boolean: ['recursive'],
  alias: {
    R: 'reporter',
    r: 'require',
    t: 'timeout'
  },
  default: {
    reporter: 'spec',
    opts: 'test/mocha.opts'
  }
})

const extensions = ['js']
const specs = argv._
// find all files, implementation from
// https://github.com/mochajs/mocha/blob/075bd51906b828812b320f33cd1c7fa60d1702f1/bin/_mocha#L379-L402
if (!specs.length) {
  specs.push('test')
}

let files = []
specs.forEach(function (arg) {
  var newFiles
  try {
    newFiles = mochaUtils.lookupFiles(arg, extensions, argv.recursive)
  } catch (err) {
    if (err.message.indexOf('cannot resolve path') === 0) {
      console.error(
        'Warning: Could not find any test files matching pattern: ' + arg
      )
      return
    }

    throw err
  }

  files = files.concat(newFiles)
})

if (is.array(argv.reporter)) {
  if (is.empty(argv.reporter)) {
    delete argv.reporter
  } else {
    argv.reporter = R.last(argv.reporter)
  }
}

if (is.string(argv.require)) {
  argv.require = [argv.require]
}

const cwd = process.cwd()
debug('proces.cwd', cwd)
module.paths.push(cwd, join(cwd, 'node_modules'))
debug('module.paths')
debug(module.paths)
debug('CLI options', argv)

if (!files.length) {
  console.error('Missing specs, for example')
  console.error('locha --env "DEBUG:foo,LOG:everything" spec')
  process.exit(1)
}
debug('found spec files')
debug(files)

const env = objectFromString(argv.env)
if (argv.compilers) {
  const compilers = objectFromString(argv.compilers)
  debug('extra compilers', compilers)
  Object.keys(compilers).forEach(extension => {
    const compiler = compilers[extension]
    debug('loading compiler', compiler, 'for extension', extension)
    require(compiler)
  })
}

if (argv.require) {
  argv.require.forEach(extraModule => {
    debug('loading -r module', extraModule)
    if (extraModule[0] === '.') {
      extraModule = join(cwd, extraModule)
    }
    require(extraModule)
  })
}

const mochaOpts = R.pick(['timeout', 'reporter'])(argv)

locha(env, mochaOpts, ...files)
  .then(Number)
  .then(failedTests => {
    process.exit(failedTests)
  })
  .catch(err => {
    console.error('Unexpected error')
    console.error(err.stack)
    process.exit(1)
  })
