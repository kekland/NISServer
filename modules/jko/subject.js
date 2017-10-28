const requester = require('../requester')

function getSubjects(data) {
  return new Promise((resolve, reject) => {
    let subjects = []
    
    getStudentData(data)
      .then(result => {
        let promiseChain = []
  
        let requestData = {
          studentID: result.studentID,
          classID: result.classID,
          school: data.school,
          jar: data.jar
        }
  
        for(let quarter = 1; quarter <= 4; quarter++) {
          requestData.quarterID = quarter
          promiseChain.push(getSubjectsOnQuarter(requestData))
        }
  
        return Promise.all(promiseChain)
      })
      .then(result => {
        for(let response of result) {
          subjects.push(response.data)
        }
        resolve({success: true, data: subjects, studentID: data.studentID})
      })
      .catch(err => {
        reject(err)
        return
      })
  })
}

function getSubjectsOnQuarter(data, listener) {
  return new Promise((resolve, reject) => {
    let requestData = {
      quarterID: data.quarterID,
      studentID: data.studentID,
      classID: data.classID,
      school: data.school,
      jar: data.jar
    }

    getLink(requestData)
      .then(result => {
        let link = result.link
        requestData.link = link
        return getSubjectsWithLink(requestData)
      })
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        reject(err)
      })
  })
}

function getSubjectsWithLink(data) {
  return new Promise((resolve, reject) => {
    let params = {
      page: 1,
      start: 0,
      limit: 100
    }
    let requestParams = {
      url: data.school + '/Jce/Diary/GetSubjects',
      requestParams: params,
      referer: data.link,
      jar: data.jar
    }

    requester.requestWithReferer(requestParams, (err, result) => {
      if(err) {
        reject(err)
        return
      }

      let response = JSON.parse(result.response)
      if(response.success === true) {
        let subjectList = []

        for(var item of response.data) {
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
          subjectList.push(object)
        }

        resolve({success:true, data: {quarter: data.quarterID, data: subjectList}})
      }
      else {
        reject({success: false, message: response.ErrorMessage})
        return
      }
    }) 
  })
}
function getLink(data) {
  return new Promise((resolve, reject) => {
    let requestData = {
      periodId: data.quarterID,
      studentId: data.studentID,
      klassId: data.classID
    }
  
    let requestParams = {
      url: data.school + '/JCEDiary/GetDiaryURL',
      requestParams: requestData,
      jar: data.jar
    }
  
    requester.request(requestParams, (err, result) => {
      if(err != null) {
        reject(err)
        return
      }

      let response = result.response
      if(response.success === true) {
        let link = response.data
        let requestParams = {
          url: link,
          requestParams: '',
          jar: data.jar
        }
        requester.request(requestParams, (err, result) => {
          if(err != null) {
            reject(err)
            return
          }
          resolve({success: true, link: link})
        })
      }
      else {
        reject({success: false, message: response.ErrorMessage})
      }
    })
  })
}

function getStudentData(data) {
  return new Promise((resolve, reject) => {
    if(data.studentID != undefined) {
      resolve({studentID: data.studentID, classID: data.classID})
      return
    }

    let requestParams = {
      url: data.school + '/JceDiary/JceDiary',
      requestParams: '',
      jar: data.jar
    }

    requester.request(requestParams, (err, result) => {
      if(err != null) {
        reject(err)
        return
      }

      let response = result.response
      resolve(getChildDataByResponse(response))
    })
  })
}

function getChildDataByResponse(response) {
  let indexStudent = response.indexOf('student: {')
  let start = indexStudent

  let studentId
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
  let classId
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
    studentID: studentId,
    classID: classId
  }
}

module.exports.getSubjects = getSubjects
