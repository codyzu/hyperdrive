var from = require('from2')

module.exports = readStream

function readStream (drive, id, opts) {
  var start = opts && opts.start || 0
  var limit = opts && opts.limit || Infinity
  var feed = drive.get(id, opts)
  var stream = from.obj(read)
  stream.id = id
  stream.blocks = feed.blocks
  feed.on('open', onopen)
  return stream

  function read (size, cb) {
    if (limit-- === 0) return cb(null, null)
    feed.get(start++, cb)
  }

  function onopen () {
    stream.blocks = feed.blocks
    stream.emit('open')
  }
}
