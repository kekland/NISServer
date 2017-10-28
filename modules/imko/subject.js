const requester = require('../requester')

function getSubjects(data) {
  return new Promise((resolve, reject) => {
    let result = []
    
    let promiseChain = []
    for(let quarter = 1; quarter <= 4; quarter++) {
      let quarterData = data
      quarterData.quarter = quarter
  
      promiseChain.push(getSubjectOnQuarter(quarterData))
    }

    Promise.all(promiseChain)
      .then(values => {
        for(var value of values) {
          result.push(value.data)
        }
        resolve({success: true, data: result, studentID: data.studentID})
      })
      .catch(err => {
        reject(err)
      })
  })
}

function getSubjectOnQuarter(data) {
  return new Promise((resolve, reject) => {
    let requestData = {
      periodId: data.quarter,
    }

    if(data.studentID != undefined) {
      requestData.studentId = data.studentID
    }

    let requestParams = {
      url: data.school + '/ImkoDiary/Subjects',
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
        let subjects = []

        for(let item of response.data) {
          subjects.push({
            id: item.Id,
            name: item.Name,
            formative: {
              current: item.ApproveCnt,
              maximum: item.Cnt
            },
            summative: {
              current: item.ApproveISA,
              maximum: item.MaxISA
            },
            grade: item.Period,
            lastChanged: item.LastChanged
          })
        }

        resolve({success: true, data: {quarter: requestData.periodId, data: subjects}})
      }
      else {
        reject({success: false, message: response.ErrorMessage})
      }
    })
  })
}

module.exports.getSubjects = getSubjects