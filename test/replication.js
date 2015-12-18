var tape = require('tape')
var memdb = require('memdb')
var hyperdrive = require('../')

tape('replicates', function (t) {
  var drive = create()
  var feed = drive.add()
  feed.append(['hello', 'world'])
  feed.finalize(function () {
    var remote = create()
    var remoteFeed = remote.get(feed.id)

    remoteFeed.ready(function () {
      t.same(remoteFeed.blocks, 2, 'remote has two blocks')
      t.end()
    })

    replicate(drive, remote)
  })
})

tape('replicate and get block', function (t) {
  var drive = create()
  var feed = drive.add()
  feed.append(['hello', 'world'])
  feed.finalize(function () {
    var remote = create()
    var remoteFeed = remote.get(feed.id)

    t.plan(6)
    remoteFeed.get(0, function (err, block) {
      t.ok(!err, 'no error')
      t.same(block, new Buffer('hello'), 'has block 0')
    })
    remoteFeed.get(1, function (err, block) {
      t.ok(!err, 'no error')
      t.same(block, new Buffer('world'), 'has block 1')
    })
    remoteFeed.get(2, function (err, block) {
      t.ok(!err, 'no error')
      t.same(block, null, 'does not have block 2')
    })

    replicate(drive, remote)
  })
})

function replicate (a, b) {
  var stream = a.createPeerStream()
  stream.pipe(b.createPeerStream()).pipe(stream)
}

function create () {
  return hyperdrive(memdb())
}
