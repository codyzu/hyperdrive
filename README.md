# hyperdrive

A file sharing network based on [rabin](https://github.com/maxogden/rabin) file chunking and append only feeds of data verified by merkle trees.

```
npm install hyperdrive
```

[![build status](http://img.shields.io/travis/mafintosh/hyperdrive.svg?style=flat)](http://travis-ci.org/mafintosh/hyperdrive)

For a more detailed technical information on how it works see [SPECIFICATION.md](SPECIFICATION.md). It runs in node.js as well as in the browser. [Try a browser based demo here](http://mafintosh.github.io/hyperdrive)

## Status

## Almost ready for prime time :rocket:
## Feel free to open issues and ask questions

APIs/protocols might be still break.

Main things missing are:

- [ ] Storing downloaded files as actual files (not in leveldb doh)
- [x] Full documention of the apis/protocols
- [ ] Tit-for-tat swarm logic
- [ ] peer discovery events so a dht would know what to look for
- [ ] Tests for internal logic
- [ ] Move archive/file abstractions to new modules
- [x] A bit of refactoring

## Usage

First lets add a stream of data to hyperdrive

``` js
var level = require('level')
var hyperdrive = require('hyperdrive')

var db = level('hyperdrive.db')
var drive = hyperdrive(db) // db can be any levelup instance

var ws = drive.createWriteStream() // lets add some data

ws.write('hello')
ws.write('world')
ws.end(function () {
  // will print e1a31bb8716f0a0487377e22dbc7f0491fb47a712ac21519792a4e32cf56fb6f
  console.log('data was stored as', ws.id.toString('hex'))
})
```

Now to access it create a read stream with the same id

``` js
var rs = drive.createReadStream('e1a31bb8716f0a0487377e22dbc7f0491fb47a712ac21519792a4e32cf56fb6f')

rs.on('data', function (data) {
  console.log(data.toString()) // prints 'hello' and 'world'
})
```

If we were only interested in the second block of data we can access the low-level feed instead of a read stream

``` js
var feed = drive.get('e1a31bb8716f0a0487377e22dbc7f0491fb47a712ac21519792a4e32cf56fb6f')

// feeds give us easy random access
feed.get(1, function (err, block) {
  console.log(block.toString()) // prints 'world'
})
```

To start replicating this feed to other peers we need pipe a peer stream to them.

``` js
// create a peer stream to start replicating feeds to other peers
var stream = drive.createPeerStream()
stream.pipe(anotherDrive.createPeerStream()).pipe(stream)
```

To find other hyperdrive peers on the internet sharing feeds we could use a peer discovery module such as [discovery-channel](https://github.com/maxogden/discovery-channel)

``` js
// lets find some hyperdrive peers on the internet sharing or interested in our feed

var disc = require('discovery-channel')() // npm install discovery-channel
var net = require('net')

var id = new Buffer('e1a31bb8716f0a0487377e22dbc7f0491fb47a712ac21519792a4e32cf56fb6f', 'hex')
var server = net.createServer(onsocket)

server.listen(0, function () {
  announce()
  setInterval(announce, 10000)

  var lookup = disc.lookup(id.slice(0, 20))

  lookup.on('peer', function (ip, port) {
    onsocket(net.connect(port, ip))
  })
})

function onsocket (socket) {
  // connect the peers
  socket.pipe(drive.createPeerStream()).pipe(socket)
}

function announce () {
  // discovery-channel currently only works with 20 bytes hashes
  disc.announce(id.slice(0, 20), server.address().port)
}
```

## API

#### `var drive = hyperdrive(db)`

Create a new hyperdrive instance. db should be a [levelup](https://github.com/level/levelup) instance.

#### `var stream = drive.createWriteStream()`

Create a new writable stream that adds a new feed and appends blocks to it.
After the stream has been ended (`finish` has been emitted) you can access `stream.id` and `stream.blocks` to get the feed metadata.

#### `var stream = drive.createReadStream(id, [options])`

Create a readable stream that reads from a the feed specified by `id`. Optionally you can specify the following options:

``` js
{
  start: 0, // which block index to start reading from
  limit: Infinity // how many blocks to read
}
```

#### `var stream = drive.list()`

Returns a readable stream that will emit the `id` of all feeds stored in the drive.

#### `var stream = drive.createPeerStream()`

Create a new peer replication duplex stream. This stream should be piped together with a remote peer's stream to the start replicating feeds.

## Feeds

Everytime you write a stream of data to hyperdrive it gets added to an underlying binary feed. Feeds give you more low-level access to the data stored through the following api.

#### `var feed = drive.add()`

Create a new feed. Call `feed.append` to add blocks and `feed.finalize` when you're done and ready to share this feed.

#### `var feed = drive.get(id)`

Access a finalized feed by its id. By getting a feed you'll start replicating this from other peers you are connected too as well.

#### `feed.get(index, callback)`

Get a block from the the feed. If you `.get` a block index that hasn't been downloaded yet this method will wait for that block be downloaded before calling the callback.

#### `feed.append(block, [callback])`

Append a block of data to a new feed. You can only append to a feed that hasn't been finalized.

#### `feed.finalize([callback])`

Finalize a feed. Will set `feed.id` when done. This is the `id` that identifies this feed.

#### `feed.ready([callback])`

Call this method to wait for the feed to have enough metadata to populate its internal state.
After the callback has been called `feed.blocks` is guaranteed to be populated. You *do not* have to call `feed.ready` before trying to `.get` a block. This method is just available for convenience.

#### `var blocks = feed.blocks`

Property containing the number of blocks this feed has. This is only known after at least one block has been fetched.

#### `var bool = feed.has(index)`

Boolean indicating wheather or not a block has been downloaded. Note that since this method is synchronous you have to wait for the feed to open before calling it.

## License

MIT
