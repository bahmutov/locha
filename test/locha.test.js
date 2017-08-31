import test from 'ava'
import locha from '..'
import { objectFromString, envFromString } from '../src/utils'

test('basic', t => {
  t.is(typeof locha, 'function')
})

test('single object', t => {
  t.snapshot(objectFromString('DEBUG:foo'))
})

test('multiple properties', t => {
  t.snapshot(objectFromString('DEBUG:foo,LOG:verbose'))
})

test('one compiler', t => {
  t.snapshot(objectFromString('coffee:coffee-script/register'))
})

test('several compilers', t => {
  t.snapshot(objectFromString('coffee:coffee-script/register,ts:typescript'))
})

test('environment from string', t => {
  const s = 'DEBUG=foo:*,bar;LOG=verbose'
  t.snapshot(envFromString(s))
})
