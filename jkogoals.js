var unirest = require('unirest')

function getGoals(data, response) {
  var paramsTopic = {
    evalId: data.topicEvaluationID,
    journalId: data.journalID,
    page:'1',
    start:'0',
    limit:'100'
  }

  console.log('1')
  unirest.post(data.school + '/Jce/Diary/GetResultByEvalution')
  .jar(data.jar)
  .send(paramsTopic)
  .end(function(resultTopic) {
    console.log('2')
    var paramsQuarter = {
      evalId: data.quarterEvaluationID,
      journalId: data.journalID,
      page:'1',
      start:'0',
      limit:'100'
    }

    unirest.post(data.school + '/Jce/Diary/GetResultByEvalution')
    .jar(data.jar)
    .send(paramsQuarter)
    .end(function(resultQuarter) {
      console.log(JSON.stringify(resultTopic))
      console.log(JSON.stringify(resultQuarter))
      if(resultTopic.success === true && resultQuarter === true) {
        console.log('4')
        var data = []
        for(var index = 0; index < resultTopic.data.length; index++) {
          var itemTopic = resultTopic.data[index]
          var itemQuarter = resultQuarter.data[index]

          data.push({
            name: itemTopic.Name,
            topic: {
              score: itemTopic.Score,
              maxScore: itemTopic.MaxScore
            },
            quarter: {
              score: itemQuarter.Score,
              maxScore: itemQuatrter.MaxScore
            }
          })
        }

        response.send(JSON.stringify({success:true, data:data}))
      }
      else {
        response.send(JSON.stringify({success:false, message:paramsTopic.message}))
      }
    })

  })


}

module.exports.getGoals = getGoals
