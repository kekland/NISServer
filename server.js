const express = require('express')

var bodyParser = require('body-parser')
var unirest = require('unirest')
var jsonfile = require('jsonfile');

var fs = require('fs');

var account = require('./account')
var imko = require('./imko')
var jko = require('./jko')

var imkogoals = require('./imkogoals')
var jkogoals = require('./jkogoals')

const app = express()
const port = 3000;

var users = {}

function exitHandler() {
  fs.writeFileSync('./data/data.json', JSON.stringify(users))
  process.exit()
}

process.on('exit', exitHandler.bind(null));
process.on('SIGINT', exitHandler.bind(null));
process.on('SIGUSR1', exitHandler.bind(null));
process.on('SIGUSR2', exitHandler.bind(null));

console.log('Initializing server')
console.log('Loading data')

users = JSON.parse(fs.readFileSync('./data/data.json', 'utf-8'))

console.log('Finished loading data')

function updateCookies(data, listener) {
  var user = users[data.pin]
  if(user == undefined) {
    listener({success:false, message:'User did not log-in'})
    return
  }
  else if(user.password != data.password) {
    listener({success:false, message:'Incorrect credentials'})
    return
  }

  account.updateCookies(user, function(result) {
    if(result.success === true) {
      var time = getTime()
      users[result.pin] = {
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
  var time = new Date();
  var timedata =
    ("0" + time.getHours()).slice(-2)   + ":" +
    ("0" + time.getMinutes()).slice(-2) + ":" +
    ("0" + time.getSeconds()).slice(-2);
  return timedata
}

//Body parsers
app.use(bodyParser.urlencoded({ extended: true }));

app.use((request, response, next) => {
  console.log(request.headers)
  next()
})

//Public functions
app.post('/Login/', (request, response) => {
  account.fullLogin(request, response,
    function callback(result) {
      if(result.success === true) {
        var time = getTime()
        users[result.pin] = {
          pin: result.pin,
          password: result.password,
          school: result.school,
          role: result.role,
          roles: result.roles,
          locale: result.locale,
          jar: result.jar,
          loginTime: time
          //raw: JSON.stringify(result)
        }
      }
    })
})

app.post('/GetIMKOSubjects/', (request, response) => {
  var data = request.body
  updateCookies(data, function(result) {
    if(result.success === true) {
      var user = users[data.pin]
      imko.getSubjects({school: user.school, childID: data.childID, jar: user.jar}, response)
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})
app.post('/GetIMKOSubjectsByQuarter/', (request, response) => {
  var data = request.body
  updateCookies(data, function(result) {
    if(result.success === true) {
      var user = users[data.pin]
      imko.getSubjectsByQuarter({school: user.school, quarterID: data.quarterID, childID: data.childID, jar: user.jar}, response)
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})

app.post('/GetJKOSubjects/', (request, response) => {
  var data = request.body
  updateCookies(data, function(result) {
    if(result.success === true) {
      var user = users[data.pin]
      jko.getSubjects({school: user.school, childID: data.childID, classID: data.classID, jar:user.jar}, response)
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})

app.post('/GetJKOSubjectsByQuarter/', (request, response) => {
  var data = request.body
  updateCookies(data, function(result) {
    if(result.success === true) {
      var user = users[data.pin]
      jko.getSubjectsByQuarter({school: user.school, childID: data.childID, classID: data.classID, quarterID: data.quarterID,
        jar:user.jar}, response)
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})

app.post('/GetIMKOGoals/', (request, response) => {
  var data = request.body
  updateCookies(data, function(result) {
    if(result.success === true) {
      var user = users[data.pin]
      imkogoals.getGoals({school: user.school, childID: data.childID, quarterID: data.quarterID, subjectID: data.subjectID,
        jar:user.jar}, response)
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
})

app.post('/GetJKOGoals/', (request, response) => {
  var data = request.body
  updateCookies(data, function(result) {
    if(result.success === true) {
      var user = users[data.pin]
      jkogoals.getGoals({school: user.school, topicEvaluationID: data.topicEvaluationID,
        quarterEvaluationID: data.quarterEvaluationID, journalID: data.journalID,
        jar:user.jar}, response)
    }
    else {
      response.send(JSON.stringify(result))
    }
  })
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
  response.status(500).send('Server : Error')
})

app.listen(port)
