const express = require('express')

const bodyParser = require('body-parser')
const cors = require('cors')

const cookieParser = require('cookie-parser')
const fs = require('fs')

const account = require('./modules/account')

const subjectHandler = require('./modules/subjectHandler')
const goalsHandler = require('./modules/goalsHandler')

const app = express()
const port = process.env.PORT || 5000

var logs = []
app.set('port', port)

process.on('uncaughtException', (err) => {
  console.log(err)
})

log('Initializing server', {}, false)

function getTime() {
  let time = new Date()
  let timedata =
    ('0' + time.getHours()).slice(-2) + ':' +
    ('0' + time.getMinutes()).slice(-2) + ':' +
    ('0' + time.getSeconds()).slice(-2)
  return timedata
}

function log(message, additionalInfo, isError) {
  logs.push({
    time: getTime(),
    message: message,
    info: additionalInfo,
    error: isError
  })
  console.log(getTime() + ' | ' + message)
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

app.post('/GetData/', (request, response) => {
  let data = request.body

  log('Serving /GetData/ : Start', data, false)

  account.getData(data)
    .then(result => {
      response.send(JSON.stringify(result))
      log('Serving /GetData/ : Success', result, false)
    })
    .catch(err => {
      response.status(502)
      response.send(JSON.stringify(err))
      log('Serving /GetData/ : Failure', err, true)
      return
    })
})

app.post('/CheckCredentials/', (request, response) => {
  let data = request.body

  log('Serving /CheckCredentials/ : Start', data, false)
  
  account.checkCredentials(data)
    .then(result => {
      response.send(JSON.stringify(result))
      log('Serving /CheckCredentials/ : Success', result, false)
    })
    .catch(err => {
      response.status(502)
      response.send(JSON.stringify(err))
      log('Serving /GetData/ : Failure', err, true)
      return
    })
})

app.post('/GetCookies/', (request, response) => {
  let data = request.body

  log('Serving /GetCookies/ : Start', data, false)
  
  account.getCookies(data)
    .then(result => {
      response.send(JSON.stringify(result))
      log('Serving /GetCookies/ : Success', result, false)
    })
    .catch(err => {
      response.status(502)
      response.send(JSON.stringify(err))
      log('Serving /GetCookies/ : Failure', err, true)
      return
    })
})

app.post('/GetSubjectData/', (request, response) => {
  let data = request.body
  
  log('Serving /GetSubjectData/ : Start', data, false)
  
  subjectHandler.getSubjectData(data)
    .then(result => {
      response.send(JSON.stringify(result))
      log('Serving /GetSubjectData/ : Success', result, false)
    })
    .catch(err => {
      response.status(502)
      response.send(JSON.stringify(err))
      log('Serving /GetSubjectData/ : Failure', err, true)
      return
    })
})

app.post('/GetGoals/', (request, response) => {
  let data = request.body
  
  log('Serving /GetGoals/ : Start', data, false)

  goalsHandler.getGoals(data)
    .then(result => {
      response.send(JSON.stringify(result))
      log('Serving /GetGoals/ : Success', result, false)
    })
    .catch(err => {
      response.status(502)
      response.send(JSON.stringify(err))
      log('Serving /GetGoals/ : Failure', err, true)
      return
    })
})

app.get('/GetLogs/', (request, response) => {
  let time = getTime()
  let text = '<p>Time : ' + time + '</p>'

  for(let node of logs) {
    let nodeText = '<p'
    if(node.error) {
      nodeText += ' class="error"'
    }
    nodeText += '>'
    nodeText += node.time + ' | ' + node.message + '</p><p>'
    nodeText += JSON.stringify(node.info)
    nodeText += '</p><hr>'

    text += nodeText
  }
  response.send(text)
})

app.get('/Logs', (request, response) => {
  fs.readFile('./pages/logs.html', 'utf8', (err, data) => {
    if(err) {
      response.send(err)
      return
    }
    response.send(data)
  })
})

app.use((err, request, response, next) => {
  // log the error, for now just console.log
  response.status(500).send(JSON.stringify({success: false, message: 'Internal server error'}))
  log('Internal Server Error', err, true)
})

app.listen(port)

log('Server initialized', {}, false)