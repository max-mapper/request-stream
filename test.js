var r = require('./')
r('http://google.com', function (err, res) {
  console.log(err)
  console.log(res.statusCode)
})