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

function exitHandler () {
  fs.writeFileSync('./data/data.json', JSON.stringify(users))
  process.exit()
}

process.on('exit', exitHandler.bind(null))
process.on('SIGINT', exitHandler.bind(null))
process.on('uncaughtException', (err) => {
  console.log(err)
})

console.log('Initializing server')
console.log('Loading data')

users = JSON.parse(fs.readFileSync('./data/data.json', 'utf-8'))

console.log('Finished loading data')

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
      users[uuid] = {
        pin: result.pin,
        password: result.password,
        school: result.school,
        role: result.role,
        roles: result.roles,
        locale: result.locale,
        jar: result.jar,
        loginTime: time,
        raw: JSON.stringify(result)
      }
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

// Public functions
app.post('/Login/', (request, response) => {
  console.log('1')
  account.fullLogin(request, response,
    function callback (result) {
      if (result.success === true && request.cookies.loginID === undefined) {
        var user = users[request.cookies.loginID]
        if(user == undefined) {
          var time = getTime()
          users[result.id] = {
            pin: result.pin,
            password: result.password,
            school: result.school,
            schoolID: result.schoolID,
            role: result.role,
            roles: result.roles,
            locale: result.locale,
            jar: result.jar,
            loginTime: time
            // raw: JSON.stringify(result)
          }
        }
      }
    })
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
    if(result.success === true) 
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
  if(data.pin != undefined) 
    var user = users[request.cookies.loginID]
    if(user.password == data.password) {
      users[data.pin].locale = data.locale
      response.send(JSON.stringify({success:true}))
    }
    else {
      response.send(JSON.stringify({success:false}))
    }
  }
  else {
    response.send(JSON.stringify({success:false}))
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

app.get('/', (request, response) => {
  throw new Error('Server : Error')
})

app.use((err, request, response, next) => {
  // log the error, for now just console.log
  console.log(err)
  response.status(500).send(JSON.stringify({success: false, message: 'Internal server error'}))
})

app.listen(port)
