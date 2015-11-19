var http = require('http')
var test = require('tape')
var concat = require('concat-stream')
var r = require('./')
var url = 'http://localhost:8080'

serverTest('get', function (t, done) {
  r(url, function (err, res) {
    t.notOk(err, 'no err')
    res.pipe(concat(function (bod) {
      t.equal(bod.toString(), 'root', 'root')
      done()
    }))
  })
})

serverTest('redirect', function (t, done) {
  r(url + '/redirect', function (err, res) {
    t.notOk(err, 'no err')
    res.pipe(concat(function (bod) {
      t.equal(bod.toString(), 'root', 'redirected to root')
      done()
    }))
  })
})

serverTest('infinite redirect', function (t, done) {
  r(url + '/infiniteredirect', function (err, res) {
    t.ok(err.message.indexOf('redirects exceeded') > -1, 'got err')
    res.pipe(concat(function (bod) {
      t.equal(bod.toString(), 'infiniteredirect', 'infiniteredirect')
      done()
    }))
  })
})

serverTest('maxRedirects', function (t, done) {
  r(url + '/infiniteredirect', {maxRedirects: 3}, function (err, res) {
    t.ok(err.message.indexOf('redirects exceeded') > -1, 'got err')
    res.pipe(concat(function (bod) {
      t.equal(bod.toString(), 'infiniteredirect', 'infiniteredirect')
      done()
    }))
  })
})

serverTest('followRedirects false', function (t, done) {
  r(url + '/infiniteredirect', {followRedirects: false}, function (err, res) {
    t.notOk(err, 'no err')
    res.pipe(concat(function (bod) {
      t.equal(bod.toString(), 'infiniteredirect', 'infiniteredirect')
      done()
    }))
  })
})

function serverTest (msg, cb) {
  test(msg, function (t) {
    startServer(function (server) {
      cb(t, function () {
        server.close(function () {
          t.end()
        })
      })
    })
  })
}

function startServer (cb) {
  var server = http.createServer(function (req, res) {
    if (req.url === '/') return res.end('root')
    if (req.url === '/redirect') {
      res.statusCode = 302
      res.setHeader('location', '/')
      return res.end('redirect')
    }
    if (req.url === '/infiniteredirect') {
      res.statusCode = 302
      res.setHeader('location', '/infiniteredirect')
      return res.end('infiniteredirect')
    }
    res.end()
  })
  server.listen(8080, function (err) {
    if (err) throw err
    cb(server)
  })
}
