var subleveldown = require('subleveldown')
var feed = require('./lib/feed')
var swarm = require('./lib/swarm')
var messages = require('./lib/messages')
var writeStream = require('./lib/write-stream')
var readStream = require('./lib/read-stream')
var events = require('events')
var util = require('util')

module.exports = Hyperdrive

function Hyperdrive (db, opts) {
  if (!(this instanceof Hyperdrive)) return new Hyperdrive(db, opts)
  if (!opts) opts = {}

  events.EventEmitter.call(this)

  this.db = db
  this._hashes = subleveldown(db, 'hashes', {valueEncoding: 'binary'})
  this._blocks = subleveldown(db, 'blocks', {valueEncoding: 'binary'})
  this._bitfields = subleveldown(db, 'bitfields', {valueEncoding: 'binary'})
  this._feeds = subleveldown(db, 'feeds', {valueEncoding: messages.Feed})
  this._opened = {}

  this.swarm = swarm(this, opts)
}

util.inherits(Hyperdrive, events.EventEmitter)

Hyperdrive.prototype.createPeerStream = function () {
  return this.swarm.createStream()
}

Hyperdrive.prototype.createWriteStream = function (opts) {
  return writeStream(this, opts)
}

Hyperdrive.prototype.createReadStream = function (id, opts) {
  return readStream(this, id, opts)
}

Hyperdrive.prototype.list = function () {
  return this._feeds.createKeyStream()
}

Hyperdrive.prototype.get = function (link, opts) {
  if (typeof link === 'string') link = new Buffer(link, 'hex')
  if (link.id) {
    if (!opts) opts = link
    link = link.id
  }

  var id = link.toString('hex')
  var fd = this._opened[id]
  if (fd) return fd
  fd = this._opened[id] = feed(this, link, opts)
  this.emit('interested', fd.id)
  return fd
}

Hyperdrive.prototype.add = function (opts) {
  return feed(this, null, opts)
}

Hyperdrive.prototype._close = function (link) {
  var id = link.toString('hex')
  delete this._opened[id]
  this.emit('uninterested', link)
}
