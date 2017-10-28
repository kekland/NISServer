const requester = require('./requester')

const imkogoals = require('./imko/goals')
const jkogoals = require('./jko/goals')

const account = require('./account')

function getGoals(data) {
  return new Promise((resolve, reject) => {
    //Validation
    if(data.diary !== 'IMKO' && data.diary !== 'JKO') {
      reject({success: false, message: 'Diary should be either "IMKO" or "JKO"'})
      return
    }

    account.getData(data)
      .then(result => {
        if(data.diary === 'IMKO') {
          let requestData = {
            school: result.school,
            studentID: data.studentID,
            quarterID: data.quarterID,
            subjectID: data.subjectID,
            jar: result.jar
          }
          return imkogoals.getGoals(requestData)
        }
        else if(data.diary === 'JKO') {
          let requestData = {
            school: result.school,
            topicEvaluationID: data.topicEvaluationID,
            quarterEvaluationID: data.quarterEvaluationID,
            journalID: data.journalID,
            jar: result.jar
          }

          return jkogoals.getGoals(requestData)
        }
      })
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        reject(err)
      })
  })
}

module.exports.getGoals = getGoals