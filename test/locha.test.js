import test from 'ava'
import locha from '..'
import { objectFromString } from '../src/utils'

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
