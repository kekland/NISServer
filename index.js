const express = require('express')

var bodyParser = require('body-parser')

var cors = require('cors')

var fs = require('fs')

var account = require('./account')
var imko = require('./imko')
var jko = require('./jko')

var imkogoals = require('./imkogoals')
var jkogoals = require('./jkogoals')

var cookieParser = require('cookie-parser')

var misc = require('./misc')

const app = express()
const port = process.env.PORT || 5000
app.set('port', port)
var users = {}
var userspin = {}

function exitHandler () {
  console.log('Saving data')
  fs.writeFileSync('./data/data.json', JSON.stringify(users))
  fs.writeFileSync('./data/datapin.json', JSON.stringify(userspin))
  process.exit()
}

process.on('exit', exitHandler.bind(null))
process.on('SIGINT', exitHandler.bind(null))
process.on('SIGTERM', exitHandler.bind(null))
process.on('uncaughtException', (err) => {
  console.log(err)
})

console.log('Initializing server')
console.log('Loading data')

users = JSON.parse(fs.readFileSync('./data/data.json', 'utf-8'))
userspin = JSON.parse(fs.readFileSync('./data/datapin.json', 'utf-8'))

console.log('Finished loading data')

function setSubjectForUser(user) {

  console.log('Updating user PIN: ' + user.pin)
  var dataToSet = []
  var failed = false
  account.updateCookies(user, (cookieResult) => {
    if(cookieResult.success === true) {
      user.jar = cookieResult.jar

      if(user.diary === 'IMKO') {
        if(user.children != undefined) {
  
          var finished = 0
          for(var child of user.children) {
            var childID = child.studentID
            imko.getSubjectsWithListener(
              {school: user.school, childID: childID, jar: user.jar}, (result) => {
              if(result.success === true) {
                dataToSet.push({childID: childID, data: result.data})
                finished++
                if(finished === user.children.length) {
                  users[user.id].subjectData = dataToSet;  
                  var time = getTime()
                  users[user.id].loginTime = time 
                }
              }
              else {
                return
              }
            })
          }
  
        }
        else {
          imko.getSubjectsWithListener({school: user.school, childID: '', jar: user.jar}, (result) => {
            if(result.success === true) {
              dataToSet.push({childID: 'null', data: result.data})
              users[user.id].subjectData = dataToSet;
              var time = getTime()
              users[user.id].loginTime = time
            }
            else {
              return
            }
          })
        }
      }
      else {
        if(user.children != null) {
  
          var finished = 0
          for(var child of user.children) {
            var childID = child.studentID
            var classID = child.classID
            jko.getSubjectsWithListener(
              {school: user.school, childID: childID, classID: classID, jar:user.jar}, (result) => {
              if(result.success === true) {
                dataToSet.push({childID: childID, data: result.data})
                finished++
                if(finished === user.children.length) {
                  users[user.id].subjectData = dataToSet;
                  var time = getTime()
                  users[user.id].loginTime = time
                }
              }
              else {
                return
              }
            })
          }
  
        }
        else {
          jko.getSubjectsWithListener({school: user.school, jar:user.jar}, (result) => {
            if(result.success === true) {
              dataToSet.push({childID: 'null', data: result.data})
              users[user.id].subjectData = dataToSet; 
              var time = getTime()
              users[user.id].loginTime = time
            }
            else {
              return
            }
          })
        }
      }
    }
  })
}

var index = 0
var minInterval = 10000;

for(var key in users) {
  index++
  const user = users[key]

  setTimeout(function() {
    var interval = Object.keys(users).length * 1000
    if(interval < minInterval) {
      interval = minInterval;
    }
    setInterval(setSubjectForUser, minInterval, user)
  }, index * 1000)
}

function updateCookies(data, listener) {
  var uuid = data.cookies.loginID

  console.log(uuid)

  var user = users[uuid]
  if(user == undefined) {
    listener({success:false, message:'User did not log-in'})
    return
  }

  account.updateCookies(user, function(result) {
    if(result.success === true) {
      var time = getTime()
      users[uuid].jar = result.jar
      users[uuid].loginTime = time
    }
    listener(result)
  })
}

function getTime() {
  var time = new Date()
  var timedata =
    ('0' + time.getHours()).slice(-2) + ':' +
    ('0' + time.getMinutes()).slice(-2) + ':' +
    ('0' + time.getSeconds()).slice(-2)
  return timedata
}

// Body parsers
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());

// Enable cross-domain sharing
app.use(cors())

app.use((request, response, next) => {
  console.log(request.headers)
  next()
})

app.post('/GetSubjectData/', (request, response) => {
  var data = request.body
  updateCookies(request, function(result) {
    if(result.success === true) {
      var user = users[request.cookies.loginID]
      var subjectData = user.subjectData
      if(subjectData === undefined) {
        setSubjectForUser(user)
        response.send(JSON.stringify({success: false, data: 'null', message: 'Data has not been prepared yet. Please, update again.'}))
      }
      else {
        response.send(JSON.stringify({success: true, diary: user.diary, data: user.subjectData}))
        user.subjectDataLast = user.subjectData
      }
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})

app.post('/GetGoals/', (request, response) => {
  var data = request.body
  updateCookies(request, function(result) {
    if(result.success === true) {
      var user = users[request.cookies.loginID]
      
      if(user.diary === 'IMKO') {
        imkogoals.getGoals({school: user.school, childID: data.childID, quarterID: data.quarterID, subjectID: data.subjectID,
          jar:user.jar}, response)
      }
      else {
        jkogoals.getGoals({school: user.school, topicEvaluationID: data.topicEvaluationID,
          quarterEvaluationID: data.quarterEvaluationID, journalID: data.journalID,
          jar:user.jar}, response)
      }
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})

// Public functions
app.post('/Login/', (request, response) => {
  if(userspin[request.body.pin] != undefined && userspin[request.body.pin] != null) {
    var uuid = userspin[request.body.pin]
    var user = users[uuid]

    if(user.password != request.body.password || user.schoolID != request.body.school) {
      response.send(JSON.stringify({
        success: false,
        message: 'Invalid PIN, Password, or incorrect school selected'
      }))
      return;
    }

    var resp = {
      success: true,
      id: uuid,
      pin: user.pin,
      password: user.password,
      school: user.school,
      schoolID: user.school,
      role: user.role,
      diary: user.diary,
      roles: user.roles
    }
    if(user.chlidren != undefined) {
      resp.children = user.children
    }

    response.cookie('loginID', uuid, {maxAge: 900000, httpOnly: true})
    response.send(JSON.stringify(resp))
    return;
  }
  account.fullLogin(request, response,
    function callback (result) {
      if (result.success === true) {
        if(request.cookies.loginID != undefined) {
          users[request.cookies.loginID] = null;
        }
        var time = getTime()
        var user = result
        user.loginTime = time;
        users[result.id] = user

        userspin[user.pin] = result.id

        var interval = Object.keys(users).length * 1000
        if(interval < minInterval) {
          interval = minInterval;
        }
        setInterval(setSubjectForUser, interval, users[result.id])
      }
    })
})

app.post('/CheckUserExistence/', (request, response) => {
  var loginID = request.body.loginID
  if(userspin[loginID] !== null && userspin[loginID] !== undefined) {
    response.send(JSON.stringify({success: true}));
  }
  else {
    response.send(JSON.stringify({success: false}));
  }
})

app.post('/IMKO/GetIMKOSubjects/', (request, response) => {
  var data = request.body
  updateCookies(request, function(result) {
    if(result.success === true) {
      var user = users[request.cookies.loginID]
      imko.getSubjects({school: user.school, childID: data.childID, jar: user.jar}, response)
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})

app.post('/IMKO/GetIMKOSubjectsForQuarter/', (request, response) => {
  var data = request.body
  updateCookies(request, function(result) {
    if(result.success === true) {
      var user = users[request.cookies.loginID]
      imko.getSubjectsByQuarter({school: user.school, quarterID: data.quarterID, childID: data.childID, jar: user.jar}, response)
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})

app.post('/JKO/GetJKOSubjects/', (request, response) => {
  var data = request.body
  updateCookies(request, function(result) {
    if(result.success === true) {
      var user = users[request.cookies.loginID]
      jko.getSubjects({school: user.school, childID: data.childID, classID: data.classID, jar:user.jar}, response)
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})

app.post('/JKO/GetJKOSubjectsForQuarter/', (request, response) => {
  var data = request.body
  updateCookies(request, function(result) {
    if(result.success === true) {
      var user = users[request.cookies.loginID]
      jko.getSubjectsByQuarter({school: user.school, childID: data.childID, classID: data.classID, quarterID: data.quarterID,
        jar:user.jar}, response)
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})

app.post('/IMKO/GetIMKOGoals/', (request, response) => {
  var data = request.body
  updateCookies(request, function(result) {
    if(result.success === true) {
      var user = users[request.cookies.loginID]
      imkogoals.getGoals({school: user.school, childID: data.childID, quarterID: data.quarterID, subjectID: data.subjectID,
        jar:user.jar}, response)
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})

app.post('/JKO/GetJKOGoals/', (request, response) => {
  var data = request.body
  updateCookies(request, function(result) {
    if(result.success === true) {
      var user = users[request.cookies.loginID]
      jkogoals.getGoals({school: user.school, topicEvaluationID: data.topicEvaluationID,
        quarterEvaluationID: data.quarterEvaluationID, journalID: data.journalID,
        jar:user.jar}, response)
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})

app.post('/Data/ChangeLocale/', (request, response) => {
  var data = request.body
  var user = users[request.cookies.loginID]
  if(user !== undefined) {
    users[request.cookies.loginID].locale = data.locale
    response.send(JSON.stringify({success: true}))
  }
  else {
    response.send(JSON.stringify({success: false, message: 'User not found in database'}))
  }
})

app.post('/Data/ChangeDiary/', (request, response) => {
  var data = request.body
  var user = users[request.cookies.loginID]
  if(user !== undefined) {
    if(data.diary != 'IMKO' && data.diary != 'JKO') {
      response.send(JSON.stringify({success: false, message: 'Invalid diary type'}))
      return;
    }
    users[request.cookies.loginID].diary = data.diary
    response.send(JSON.stringify({success: true}))
  }
  else {
    response.send(JSON.stringify({success: false, message: 'User not found in database'}))
  }
})

app.post('/Notifications/LinkFCMToken', (request, response) => {
  var data = request.body
  var user = users[request.cookies.loginID]
  if(user !== undefined) {
    users[request.cookies.loginID].fcm.token = data.token
    response.send(JSON.stringify({success: true}))
  }
  else {
    response.send(JSON.stringify({success: false, message: 'User not found in database'}))
  }
})
app.post('/Misc/CheckCredentials/', (request, response) => {
  account.checkCredentials(request, response)
})

app.post('/Misc/GetPasswordStrength/', (request, response) => {
  misc.getPasswordStrength(request, response)
})

//Admin functions
app.get('/Users/', (request, response) => {
	var result = ""
  var timedata = getTime()
  result += '<html><body><h1> Current Time : ' + timedata + ' </h1><hr>'
	for(key in users) {
		var obj = users[key]
		result += '<h2>' + obj.pin + '</h2>'
    result += '<p>Password: ' + obj.password + '</p>'
    result += '<p>School: ' + obj.school + '</p>'
    result += '<p>Locale: ' + obj.locale + '</p>'
    result += '<p>Time: ' + obj.loginTime + '</p>'
    result += '<p>Role: ' + obj.role + '</p>'
    result += '<p>LoginID: ' + key + '</p>'
    result += '<p>Subject data: \n' + JSON.stringify(obj.subjectData) + '\n </p>'
    result += '<p>Subject data last opened: \n' + JSON.stringify(obj.subjectDataLast) + '\n </p>'
    result += '<p>Raw: \n' + obj.raw + '</p>'
    result += '<hr>'
	}
  result += '</body></html>'
	response.send(result)
})

app.get('/', (request, response) => {
  var text = '<html><body><h2>Welcome to eNIS server</h2>'
  text += '<hr><h3>URLs: </h3>'
  text += '<a href="/Users/">/Users/ : Get users information</a>'

  text += '</body></html>'
  response.send(text)
})

var http = require('http')
setInterval(() => {
  http.get('http://nis-api.herokuapp.com')
}, 300000)

app.get('/', (request, response) => {
  throw new Error('Server : Error')
})

app.use((err, request, response, next) => {
  // log the error, for now just console.log
  console.log(err)
  response.status(500).send(JSON.stringify({success: false, message: 'Internal server error'}))
})

app.listen(port)
