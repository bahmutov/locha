# locha

> Loud Mocha (locha) runs specs twice - first time runs all tests, 
> then the second time just the failing ones with extra environment variables

[![NPM][npm-icon] ][npm-url]

[![Build status][ci-image] ][ci-url]
[![semantic-release][semantic-image] ][semantic-url]
[![js-standard-style][standard-image]][standard-url]

## Demo

File [demo/failing-spec.js](demo/failing-spec.js) has two specs, one of which is failing.
The specs also will produce a lot of log messages if running with `DEBUG=failing ...` flag.
By default we do NOT want to see the debug log messages, but we do need these messages to
debug a failing test. Usually if CI fails, we would rerun the failing test locally with
`DEBUG=failing ...`, but why can't CI do this for us automatically? 

* Run all tests with minimal verbosity. Most of the tests (if not all!) pass.
* If any tests failed during the first run, rerun just these failing tests with
  extra environment variables. For example we can turn on verbose logging.

The demo below shows `locha` in action. First round has all the tests with just
a few `console.log` statements. Second round of testing is triggered because
test "failing spec B" fails, and is rerun with `{"DEBUG":"failing"}` additional
environment variable set, which produces a lot more output.

```text
$ npm run demo
> ./bin/locha.js demo/failing-spec.js --env DEBUG:failing

  failing spec
in "failing spec A"
    ✓ A
in "failing spec B"
    1) B

  1 passing (14ms)
  1 failing

  1) failing spec B:
     Error: B fails
      at Context.<anonymous> (demo/failing-spec.js:22:11)

mocha finished with 1 failure
Failed first time, rerunning 1 test

  failing spec
in "failing spec B"
  failing a lot of +0ms
  failing verbose +1ms
  failing messages +1ms
  failing in debug +0ms
  failing mode in test B +0ms
    1) B

  0 passing (5ms)
  1 failing

  1) failing spec B:
     Error: B fails
      at Context.<anonymous> (demo/failing-spec.js:22:11)
mocha finished with 1 failure
```

The verbose second run makes debugging just the failing tests simple and quick. I picked
environment variables to control verbosity because to me command line switches control
*what to do*, and environment variables control *how to do it*. Extra logging seems a good
"how to do it" kind of thing.

## Install

Requires [Node](https://nodejs.org/en/) version 6 or above.

```sh
npm install --save-dev locha
```

## Use

Pass additional environment variables using `--env` string, and specs as a list of files.
For example if we want to set `DEBUG=my-module MODE=test ...` during the second run with
just failing tests, the test command would be

```json
{
    "scripts": {
        "test": "locha --env 'DEBUG:my-module,MODE:test' test/*-spec.js"
    },
    "devDependencies": {
        "locha": "1.0.0"
    }
}
```

## Debugging

To see verbose log messages, run with `DEBUG=locha` environment variable

## Examples

* [CoffeeScript](coffee-example) tests

## Mocha options

Mocha supports a [LOT of command line options](https://github.com/mochajs/mocha/blob/master/bin/_mocha#L62).
Locha only supports some of them. Here they are

```
-t, --timeout <ms>
-r, --require <module name>
--compilers <ext1>:<module name1>,<ext2>:<module name2>
--opts <filename>
```

## Related projects

* [focha](https://github.com/bahmutov/focha) - Mocha 
    wrapper that runs previously failed tests first
* [rocha](https://github.com/bahmutov/rocha) - Runs Mocha unit tests but randomizes their order
* [snap-shot-it](https://github.com/bahmutov/snap-shot-it) - Smarter snapshot utility for 
    Mocha and BDD test runners

### Small print

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2017

* [@bahmutov](https://twitter.com/bahmutov)
* [glebbahmutov.com](https://glebbahmutov.com)
* [blog](https://glebbahmutov.com/blog)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/locha/issues) on Github

## MIT License

Copyright (c) 2017 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

[npm-icon]: https://nodei.co/npm/locha.svg?downloads=true
[npm-url]: https://npmjs.org/package/locha
[ci-image]: https://travis-ci.org/bahmutov/locha.svg?branch=master
[ci-url]: https://travis-ci.org/bahmutov/locha
[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/
