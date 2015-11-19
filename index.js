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
  var redirects = 0
  var maxRedirects = 10
  return function httpRequest (url, opts, cb) {
    if (typeof opts === 'function') return httpRequest(url, {}, opts)
    if (typeof url === 'undefined') throw new Error('Must supply url')
    if (typeof cb === 'undefined') throw new Error('Must supply callback')
    if (opts.method) method = opts.method
    if (opts.maxRedirects) maxRedirects = opts.maxRedirects

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
    if (debug.enabled) debug('request', JSON.stringify(reqOpts))
    req.on('error', done)
    req.on('response', function (res) {
      var redir = shouldRedirect(req, res)
      debug('response', res.statusCode)
      if (redir) {
        if (redirects >= maxRedirects) {
          return done(new Error('Max redirects exceeded: ' + maxRedirects), res)
        }
        debug('redirect', redir)
        reqOpts.path = redir
        httpRequest(redir, reqOpts, done)
        redirects++
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
