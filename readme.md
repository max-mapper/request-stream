# request-stream

Extremely minimal wrapper around node core `http`/`https` to get request and response streams.

[![travis][travis-image]][travis-url]

[travis-image]: https://img.shields.io/travis/maxogden/request-stream.svg?style=flat
[travis-url]: https://travis-ci.org/maxogden/request-stream

### why

This module is under 100 lines of code, total file + folder size including `node_modules` is 150kb, compared to 4.7mb for the popular `request` module. The benefit and drawback of this module is that it doesn't have that many features. Use it if you want something low level and lightweight.

## usage

### `var request = require('request-stream')`

You can now use `request` to make new requests

### `var req = request(url, [opts], callback)`

`req` is a writable stream. Data written to it will be written to the request upload body. For requests wtih an upload body you **must call** `req.end()` for the request to finish, even if you write no data to it. If you don't call `req.end()` you will never receive a response.

`url` is the HTTP url for this request

`opts` are request options:

- **method** - default `GET` - sets HTTP method
- **host** - defaults to the hostname from `url`
- **path** - defaults to the path from `url`
- **port** - defaults to the port from `url`
- **maxRedirects** - defaults to `10`
- **followRedirects** - defaults to `true`

`callback` is called with `(err, res)`. If there was no `err`, `res` will be a readable stream of the response data.

In the event that `maxRedirects` was exceeded you will receive both an `err` and the `res` of the last redirect.

Both `req` and `res` are the unmodified [`http.ClientRequest`](https://nodejs.org/api/http.html#http_class_http_clientrequest) and [`http.IncomingMessage`](https://nodejs.org/api/http.html#http_http_incomingmessage)

### convenience methods

These set the `method` option for you

#### request.get(url, opts, cb)

#### request.post(url, opts, cb)

#### request.put(url, opts, cb)

#### request.delete(url, opts, cb)

#### request.head(url, opts, cb)
