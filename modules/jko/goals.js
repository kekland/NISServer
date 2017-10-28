const requester = require('../requester')

function getGoals (data) {

  return new Promise((resolve, reject) => {
    let requestParams = {
      evalID: data.topicEvaluationID,
      journalID: data.journalID,
      page: '1',
      start: '0',
      limit: '100',
      school: data.school,
      jar: data.jar
    }
  
    let resultTopic = undefined
    let resultQuarter = undefined
  
    getGoalOnEvaluation(requestParams)
      .then(topicResult => {
        requestParams.evalID = data.quarterEvaluationID
        resultTopic = topicResult
        return getGoalOnEvaluation(requestParams)
      })
      .then(quarterResult => {
        resultQuarter = quarterResult
        
        let data = []
        for (var index = 0; index < resultTopic.data.length; index++) {
          let itemTopic = resultTopic.data[index]
          let itemQuarter = resultQuarter.data[index]
  
          data.push({
            name: itemTopic.Name,
            topic: {
              score: itemTopic.Score,
              maxScore: itemTopic.MaxScore
            },
            quarter: {
              score: itemQuarter.Score,
              maxScore: itemQuarter.MaxScore
            }
          })
        }
        resolve({success: true, data: data})
      })
      .catch(err => {
        reject(err)
      })
  })
}

function getGoalOnEvaluation(data) {
  return new Promise((resolve, reject) => {
    let requestParams = {
      url: data.school + '/Jce/Diary/GetResultByEvalution',
      requestParams: {
        evalId: data.evalID,
        journalId: data.journalID,
        page: '1',
        start: '0',
        limit: '100'
      },
      jar: data.jar
    }

    requester.request(requestParams, (err, result) => {
      if(err) {
        reject(err)
        return
      }
  
      let response = result.response
      if(response.success === true) {
        resolve(response)
      }
      else {
        reject({success: false, message: response.ErrorMessage})
      }
    })
  
  })
}

module.exports.getGoals = getGoals
