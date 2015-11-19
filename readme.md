# request-stream

Extremely minimal wrapper around node core `http`/`https` to conveniently get request and response streams.

## usage

### `var request = require('request-stream')`

You can now use `request` to make new requests

### `var req = request(url, [opts], callback)`

`req` is a writable stream. Data written to it will be written to the request upload body. You **must call** `req.end()` for the request to finish, even if you write no data to it. If you don't call `req.end()` you will never receive a response.

`url` is the HTTP url for this request

`opts` are request options:

- **method** - default `GET` - sets HTTP method
- **host** - defaults to the hostname from `url`
- **path** - defaults to the path from `url`
- **port** - defaults to the port from `url`

`callback` is called with `(err, res)`. If there was no `err`, `res` will be a readable stream of the response data.

Both `req` and `res` are the unmodified [`http.ClientRequest`](https://nodejs.org/api/http.html#http_class_http_clientrequest) and [`http.IncomingMessage`](https://nodejs.org/api/http.html#http_http_incomingmessage)

### convenience methods

These set the `method` option for you

#### request.get(url, opts, cb)

#### request.post(url, opts, cb)

#### request.put(url, opts, cb)

#### request.delete(url, opts, cb)

#### request.head(url, opts, cb)