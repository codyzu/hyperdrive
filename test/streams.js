var tape = require('tape')
var memdb = require('memdb')
var hyperdrive = require('../')

tape('write and read', function (t) {
  var drive = create()
  var ws = drive.createWriteStream()

  ws.write('hello')
  ws.write('world')
  ws.end(function () {
    t.same(ws.blocks, 2, 'two blocks')
    t.ok(ws.id, 'has id after finish')
    var rs = drive.createReadStream(ws.id)
    var expected = ['hello', 'world']

    rs.on('data', function (data) {
      t.same(data.toString(), expected.shift(), 'data was written')
    })
    rs.on('end', function () {
      t.same(expected.length, 0, 'no more data')
      t.end()
    })
  })
})

tape('read limit', function (t) {
  var drive = create()
  insert(drive, function (id) {
    var rs = drive.createReadStream(id, {limit: 1})
    var expected = ['hello']

    rs.on('data', function (data) {
      t.same(data.toString(), expected.shift(), 'data was written')
    })
    rs.on('end', function () {
      t.same(expected.length, 0, 'no more data')
      t.end()
    })
  })
})

tape('read start', function (t) {
  var drive = create()
  insert(drive, function (id) {
    var rs = drive.createReadStream(id, {start: 1})
    var expected = ['world']

    rs.on('data', function (data) {
      t.same(data.toString(), expected.shift(), 'data was written')
    })
    rs.on('end', function () {
      t.same(expected.length, 0, 'no more data')
      t.end()
    })
  })
})

tape('empty write', function (t) {
  var drive = create()
  var ws = drive.createWriteStream()

  ws.end(function () {
    t.same(ws.blocks, 0, 'no blocks')
    t.same(ws.id, null, 'no id')
    t.end()
  })
})

function insert (drive, cb) {
  var ws = drive.createWriteStream()
  ws.write('hello')
  ws.write('world')
  ws.end(function () {
    cb(ws.id)
  })
}

function create () {
  return hyperdrive(memdb())
}
