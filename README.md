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

``` js
// TODO: add new example
```

## API

#### `var drive = hyperdrive(db)`

Create a new hyperdrive instance. db should be a [levelup](https://github.com/level/levelup) instance.

#### `var stream = drive.createPeerStream()`

Create a new peer replication duplex stream. This stream should be piped together with another
peer stream somewhere else to start replicating the feeds

#### `var feed = drive.add()`

Add a new feed to share. Call `.append` to add blocks and `.finalize` when you're done and ready to share this feed.

#### `var feed = drive.get(id)`

Access a finalized feed by it's id

#### `feed.get(index, callback)`

Get a block from the the feed.

#### `feed.append(block, [callback])`

Append a block of data to a new feed. You can only append to a feed that hasn't been finalized.

#### `feed.finalize([callback])`

Finalize a feed. Will set `feed.id` when done. This is the `id` that identifies this feed.

#### `var opened = feed.opened`

Boolean variable that indicates wheather or not the internal feed state has been loaded yet. Then it is loaded `open` is emitted as well.

#### `var blocks = feed.blocks`

Property containing the number of blocks this feed has. This is only known after a block has been fetched.

#### `var has = feed.has(block)`

Boolean indicating wheather or not a block has been downloaded. Note that since this method is synchronous you have to wait for the feed to open before calling it.

#### `feed.ready([callback])`

Call this method to wait for the feed to have enough metadata to populate its internal state.
After the callback has been called `feed.blocks` is guaranteed to be populated. You *do not* have to call `feed.ready` before trying to `.get` a block. This method is just available for convenience.

## License

MIT
