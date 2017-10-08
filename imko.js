var unirest = require('unirest')

function getSubjects(data, response) {
  var result = []
  var failed = false
  var finished = 0
  for(var i = 1; i <= 4; i++) {
    var requestData = {
      quarterID: i,
      childID: data.childID,
      school: data.school,
      jar : data.jar
    }
    const quarter = i
    getSubjectOnPeriod(requestData, function(reqResult) {
      if(reqResult.success === true) {
        result[quarter - 1] = {
          quarter: quarter,
          data: reqResult.data
        }
        finished += 1
        if(finished == 4) {
          response.send(JSON.stringify(result))
        }
      }
      else {
        if(!failed) {
          failed = true
          response.send(JSON.stringify(reqResult))
        }
      }
    })
  }
}

function getSubjectsByPeriod(data, response) {
  getSubjectOnPeriod(data, function(result) {
    response.send(JSON.stringify(result))
  })
}

function getSubjectOnPeriod(data, listener) {
  var requestData = {
    periodId: data.quarterID,
  }
  if(data.childID != undefined) {
    requestData.studentId = data.childID
  }

  unirest.post(data.school + '/ImkoDiary/Subjects')
  .send(requestData)
  .encoding('utf-8')
  .jar(data.jar)
  .end(function(responseText) {
    var response = responseText.body
    if(response.success === true) {
      listener({success:true, data:response.data})
    }
    else {
      listener({success:false, message:response.message})
    }
  })
}

module.exports.getSubjectsByPeriod = getSubjectsByPeriod
module.exports.getSubjects = getSubjects
