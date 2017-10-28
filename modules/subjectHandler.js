const account = require('./account')

const imkoSubject = require('./imko/subject')

const jkoSubject = require('./jko/subject')

function getSubjectData(data) {
  return new Promise((resolve, reject) => {
    if(data.diary !== 'IMKO' && data.diary !== 'JKO') {
      reject({success: false, message: 'Diary should be either "IMKO" or "JKO"'})
      return
    }

    account.getData(data)
      .then(result => {
        let requestData = {
          school: result.school,
          jar: result.jar
        }
        if(data.diary === 'IMKO') {
          if(result.children != undefined) {
            let promiseChain = []
            for(let student of result.children) {
              let studentID = student.student.id
              requestData.studentID = studentID
              promiseChain.push(imkoSubject.getSubjects(requestData))
            }

            return promiseHandlerIMKOChildren(promiseChain)
          }
          else {
            return promiseHandlerIMKO(imkoSubject.getSubjects(requestData))
          }
        }
        else {
          if(result.children != undefined) {
            let promiseChain = []
            for(let student of result.children) {

              requestData.studentID = student.student.id
              requestData.classID = student.class.id

              promiseChain.push(jkoSubject.getSubjects(requestData))
            }

            return promiseHandlerJKOChildren(promiseChain)
          }
          else {
            return promiseHandlerJKO(jkoSubject.getSubjects(requestData))
          }
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

function promiseHandlerIMKOChildren(promiseChain) {
  return new Promise((resolve, reject) => {
    Promise.all(promiseChain)
    .then(result => {
      let data = []
      for(let res of result) {
        data.push({childID: res.studentID, data: res.data})
      }
      resolve({success: true, diary: 'IMKO', data: data})
    })
    .catch(err => {
      reject(err)
    })
  })
}

function promiseHandlerJKOChildren(promiseChain) {
  return new Promise((resolve, reject) => {
    Promise.all(promiseChain)
    .then(result => {
      let data = []
      for(let res of result) {
        data.push({childID: res.studentID, data: res.data})
      }
      resolve({success: true, diary: 'JKO', data: data})
    })
    .catch(err => {
      reject(err)
    })
  })
}

function promiseHandlerIMKO(promise) {
  return new Promise((resolve, reject) => {
    promise.then(result => {
      let data = []
      data.push({childID: 'null', data: result.data})
      resolve({success: true, diary: 'IMKO', data: data})
    })
    .catch(err => {
      reject(err)
    })
  })
}

function promiseHandlerJKO(promise) {
  return new Promise((resolve, reject) => {
    promise.then(result => {
      let data = []
      data.push({childID: 'null', data: result.data})
      resolve({success: true, diary: 'JKO', data: data})
    })
    .catch(err => {
      reject(err)
    })
  })
}

module.exports.getSubjectData = getSubjectData