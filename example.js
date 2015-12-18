var hyperdrive = require('./')
var memdb = require('memdb')

function create () {
  return hyperdrive(memdb())
}

var a = create()
var b = create()

var streamA = a.createPeerStream()
var streamB = b.createPeerStream()

streamA.pipe(streamB).pipe(streamA)

var feed = a.createWriteStream()

feed.write('hello')
feed.write('world')
feed.write('or verden')
feed.write('or world')
feed.end(function () {
  var feed2 = b.createReadStream(feed.id, {start: 1})
  feed2.on('data', console.log)
})
