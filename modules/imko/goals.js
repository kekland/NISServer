const requester = require('../requester')

function getGoals(data) {
  return new Promise((resolve, reject) => {
    let requestData = {
      periodId: data.quarterID,
      subjectId: data.subjectID
    }
  
    if(data.studentID != undefined) {
      requestData.studentId = data.studentID
    }
  
    let requestParams = {
      url: data.school + '/ImkoDiary/Goals',
      requestParams: requestData,
      jar: data.jar
    }
  
    requester.request(requestParams, (err, result) => {
      if(err != null) {
        reject(err)
        return
      }
  
      var response = result.response
      if(response.success === true) {
        var goals = response.data.goals
        var homework = response.data.homeworks
  
        var result = {}
  
        var resultGoals = []
        var resultHomework = []
  
        var previousGroupIndex = '-1'
  
        for(var item of goals) {
          var groupIndex = item.GroupIndex
          if(groupIndex != previousGroupIndex) {
            previousGroupIndex = groupIndex
            resultGoals.push({index: groupIndex, text: item.GroupName, data: []})
          }
          var value = item.Value
          var code
          if(value == 'Achieved' || value == 'Достиг' || value == 'Жетті') {
            code = '1'
          }
          else if(value == 'Working towards' || value == 'Стремится' || value == 'Тырысады') {
            code = '-1'
          }
          else {
            code = '0'
          }
          var date = item.Changed
          if(date != undefined && date.length > 0) {
            date = date.substring(8, 10) + '.' + date.substring(5, 7) + '.' + date.substring(0, 4)
          }
          var object = {
            id: item.Id,
            name: item.Name,
            description: item.Description,
            status: value,
            statusCode: code,
            comment: item.Comment,
            changedDate: date
          }
          resultGoals[resultGoals.length - 1].data.push(object)
        }
  
        for(var item of homework) {
          var object = {
            description: item.description,
            date: item.date,
            files: []
          }
          for(var file in item.files) {
            object.files.push({
              name: file.substring(file.indexOf('.')),
              url: file
            })
          }
          resultHomework.push(object)
        }
  
        result = {success:true, goals:resultGoals, homework:resultHomework}
        resolve(result)
      }
      else {
        reject(JSON.stringify({success:false, message:result.message}))
      }
    })
  })
}

module.exports.getGoals = getGoals
