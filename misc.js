var unirest = require('unirest')

function getPasswordStrength (request, response) {
  var data = request.body
  unirest.post(data.school + '/Account/GetPassStrength')
  .send({pass: data.password})
  .end(function (result) {
    if (result.statusType === 2) {
      response.send({strength: result.body})
    }
  })
}

module.exports.getPasswordStrength = getPasswordStrength
