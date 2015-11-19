var http = require('http')
var https = require('https')
var parseUrl = require('url').parse
var xtend = require('xtend')

module.exports = requester('GET')
module.exports.get = module.exports
module.exports.post = requester('POST')
module.exports.put = requester('PUT')
module.exports.del = requester('DELETE')
module.exports.head = requester('HEAD')

function requester (method) {
  return function httpRequest (url, opts, cb) {
    if (typeof opts === 'function') return httpRequest(url, {}, opts)
    if (typeof url === 'undefined') throw new Error('Must supply url')
    if (typeof cb === 'undefined') throw new Error('Must supply callback')
    if (opts.method) method = opts.method

    if (!/:\/\//.test(url)) url = 'http://' + url

    var parsed = parseUrl(url)
    var host = parsed.hostname
    var port = parsed.port
    var path = parsed.path
    var mod = parsed.protocol === 'https:' ? https : http
    var called = false

    var defaults = {
      method: method,
      host: host,
      path: path,
      port: port
    }

    var reqOpts = xtend(defaults, opts)
    var req = mod.request(reqOpts)

    req.on('error', done)
    req.on('response', function (res) {
      done(null, res)
    })

    if (method === 'GET' || method === 'HEAD' || method === 'DELETE') req.end()
    return req

    function done (err, res) {
      if (called) return
      called = true
      if (err) return cb(err)
      cb(null, res)
    }
  }
}
