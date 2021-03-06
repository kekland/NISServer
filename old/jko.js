var unirest = require('unirest')

function getSubjectsWithListener(data, listener) {
  var subjects = []
  var finished = 0
  var failed = false

  getStudentData(data, function(dataResult) {
    for(var i = 1; i <= 4; i++) {
      const quarter = i
      var reqData = {
        quarterID: quarter,
        childID: dataResult.childID,
        classID: dataResult.classID,
        school: data.school,
        jar: data.jar
      }
      getSubjectsOnQuarter(reqData, function(result) {
        var resultSubjects = result
        if(resultSubjects.success === true) {
          subjects[quarter - 1] = {
            quarter: quarter,
            data: resultSubjects.data
          }
          finished += 1
          if(finished == 4) {
            listener({success: true, data: subjects})
          }
        }
        else {
          if(!failed) {
            failed = true;
            listener(result)
          }
        }
      })
    }
  })
}

function getSubjects(data, response) {
  var subjects = []
  var finished = 0
  var failed = false
  getStudentData(data, function(dataResult) {
    for(var i = 1; i <= 4; i++) {
      const quarter = i
      var reqData = {
        quarterID: quarter,
        childID: dataResult.childID,
        classID: dataResult.classID,
        school: data.school,
        jar: data.jar
      }
      getSubjectsOnQuarter(reqData, function(result) {
        var resultSubjects = result
        if(resultSubjects.success === true) {
          subjects[quarter - 1] = {
            quarter: quarter,
            data: resultSubjects.data
          }
          finished += 1
          if(finished == 4) {
            response.send(JSON.stringify(subjects))
          }
        }
        else {
          if(!failed) {
            failed = true;
            response.send(JSON.stringify(result))
          }
        }
      })
    }
  })
}

function getSubjectsByQuarter(data, response) {
  var failed = false
  getStudentData(data, function(dataResult) {
    const quarter = data.quarterID
    var reqData = {
      quarterID: quarter,
      childID: dataResult.childID,
      classID: dataResult.classID,
      school: data.school,
      jar: data.jar
    }
    getSubjectsOnQuarter(reqData, function(result) {
      response.send(JSON.stringify(result))
    })
  })
}

function getSubjectsOnQuarter(data, listener) {
  var requestData = {
    quarterID: data.quarterID,
    childID: data.childID,
    classID: data.classID,
    school: data.school,
    jar: data.jar
  }
  getLink(requestData, function(linkResult) {
    if(linkResult.success === true) {
      var link = linkResult.link
      var params = {
        page: 1,
        start: 0,
        limit: 100
      }

      unirest.post(data.school + '/Jce/Diary/GetSubjects')
      .jar(data.jar)
      .header('Referer', link)
      .send(params)
      .end(function(subjectsResult) {
        if(subjectsResult.statusType == 2) {
          var response = JSON.parse(subjectsResult.body)
          var data = response.data
          var resp = []
          for(var item of data) {
            var object = {
              id: item.JournalId,
              name: item.Name,
              grade: item.Mark,
              percent: item.Score
            }
            if(item.Evalutions.length > 0) {
              object.topicEvaluationID = item.Evalutions[0].Id
              object.quarterEvaluationID = item.Evalutions[1].Id
            }
            resp.push(object)
          }
          listener({success:true, data:resp})
        }
        else {
          listener({success: false, message: 'No connection to server'})
        }
      })
    }
    else {
      listener(linkResult)
    }
  })
}

function getLink(data, listener) {
  var requestData = {
    periodId: data.quarterID,
    studentId: data.childID,
    klassId: data.classID
  }

  unirest.post(data.school + '/JCEDiary/GetDiaryURL')
  .send(requestData)
  .jar(data.jar)
  .end(function(responseText) {
    if(responseText.statusType == 2) {
      var response = responseText.body
      if(response.success === true) {
        var link = response.data
        unirest.post(link)
        .jar(data.jar)
        .end(function(linkResponse) {
          listener({success:true, link: link})
        })
      }
      else {
        listener({success:false})
      }
    }
    else {
      listener({success: false, message: 'No connection to server'})
    }
  })
}

function getStudentData(data, listener) {
  if(data.childID != undefined) {
    listener({childID: data.childID, classID: data.classID})
    return
  }
  unirest.post(data.school + '/JceDiary/JceDiary')
  .jar(data.jar)
  .end(function(responseText) {
    if(responseText.statusType == 2) {
      var response = responseText.body
      listener(getChildDataByResponse(response))
    }
    else {
      listener({success: false, message: 'No connection to server'})
    }
  })
}

function getChildDataByResponse(response) {
  var indexStudent = response.indexOf('student: {')
  var b = 0
  var start = indexStudent

  var studentId
  for(var i = indexStudent; i < response.length; i++) {
    if(response[i] == ':') {
      start = i + 1
    }
    else if(response[i] == ',') {
      studentId = response.substring(start, i)
      break
    }
  }

  indexStudent = response.indexOf('klass: {')
  var classId
  for(var i = indexStudent; i < response.length; i++) {
    if(response[i] == ':') {
      start = i + 1
    }
    else if(response[i] == ',') {
      classId = response.substring(start, i)
      break
    }
  }
  return {
    childID: studentId,
    classID: classId
  }
}
module.exports.getSubjectsWithListener = getSubjectsWithListener
module.exports.getSubjects = getSubjects
module.exports.getSubjectsByQuarter = getSubjectsByQuarter
