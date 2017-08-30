#!/usr/bin/env node

'use strict'

const { objectFromString } = require('../src/utils')
const locha = require('..')
const argv = require('minimist')(process.argv.slice(2), {
  string: 'env'
})
const specs = argv._

if (!specs.length) {
  console.error('Missing specs, for example')
  console.error('locha --env "DEBUG:foo,LOG:everything" spec/*.js')
  process.exit(1)
}

const env = objectFromString(argv.env)

locha(env, ...specs)
  .then(Number)
  .then(failedTests => {
    process.exit(failedTests)
  })
  .catch(err => {
    console.error('Unexpected error')
    console.error(err.stack)
    process.exit(1)
  })
