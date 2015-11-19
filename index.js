var http = require('http')
var https = require('https')
var parseUrl = require('url').parse
var xtend = require('xtend')
var debug = require('debug')('request-stream')

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
      port: port,
      maxRedirects: 10
    }

    var reqOpts = xtend(defaults, opts)
    var req = mod.request(reqOpts)
    debug('request %j', reqOpts)
    req.on('error', done)
    req.on('response', function (res) {
      var redir = shouldRedirect(req, res)
      debug('response', res.statusCode)
      if (redir) {
        if (opts.followRedirects === false) return done(null, res)
        if (opts.maxRedirects === 0) {
          return done(new Error('Max redirects exceeded'), res)
        }
        debug('redirect', redir)
        reqOpts.path = redir
        reqOpts.maxRedirects--
        httpRequest(redir, reqOpts, done)
      }
      else done(null, res)
    })

    if (method === 'GET' || method === 'HEAD' || method === 'DELETE') req.end()
    return req

    function done (err, res) {
      if (called) return
      called = true
      if (err) return cb(err, res)
      cb(null, res)
    }
  }
}

function shouldRedirect (req, res) {
  var redirectTo = false
  var loc = res.headers['location']
  var code = res.statusCode
  if (code >= 300 && code < 400 && typeof loc !== 'undefined') {
    var mtd = req.method
    if (mtd === 'PATCH' || mtd === 'PUT' || mtd === 'POST' || mtd === 'DELETE') return false
    redirectTo = loc
  }
  return redirectTo
}
