var hyperdrive = require('./')
var memdb = require('memdb')

function create () {
  return hyperdrive(memdb())
}

function replicate (a, b) {
  var stream = a.createPeerStream()
  stream.pipe(b.createPeerStream()).pipe(stream)
}

var a = create()
var b = create()

replicate(a, b)

var ws = a.createWriteStream()

ws.write('hello')
ws.write('world')
ws.end(function () {
  console.log('wrote:', ws.id.toString('hex'))

  var rs = b.createReadStream(ws.id)

  rs.on('data', function (data) {
    console.log('data: ' + data)
  })
})
