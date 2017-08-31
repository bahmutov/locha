debug = require("debug")("verbose")

describe "example", ->
  it "works A", ->
    debug("inside A")
  it "works B", ->
    debug("inside B")
  it "works C", ->
    debug("inside C")
  it "works D", ->
    debug("inside D")
  it "works E", ->
    debug("inside E")
  it "works with async test", (done) ->
    setTimeout(done, 3000)
