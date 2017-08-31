#!/usr/bin/env node

'use strict'

const R = require('ramda')
const is = require('check-more-types')
const join = require('path').join
const debug = require('debug')('locha')
const { objectFromString } = require('../src/utils')
const locha = require('..')
const minimist = require('minimist')

const argv = minimist(process.argv.slice(2), {
  string: ['env', 'compilers', 'require'],
  alias: {
    r: 'require',
    t: 'timeout'
  }
})
const specs = argv._

if (is.string(argv.require)) {
  argv.require = [argv.require]
}

const cwd = process.cwd()
debug('proces.cwd', cwd)
module.paths.push(cwd, join(cwd, 'node_modules'))
debug('module.paths')
debug(module.paths)
debug('CLI options', argv)

if (!specs.length) {
  console.error('Missing specs, for example')
  console.error('locha --env "DEBUG:foo,LOG:everything" spec/*.js')
  process.exit(1)
}

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

const mochaOpts = R.pick(['timeout'])(argv)

locha(env, mochaOpts, ...specs)
  .then(Number)
  .then(failedTests => {
    process.exit(failedTests)
  })
  .catch(err => {
    console.error('Unexpected error')
    console.error(err.stack)
    process.exit(1)
  })
