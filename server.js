const express = require('express')
var bodyParser = require('body-parser')
var unirest = require('unirest')
const account = require('./account')

const app = express()
const port = 3000;

const users = {}

app.use(bodyParser.urlencoded({ extended: true }));

app.use((request, response, next) => {
  console.log(request.headers)
  next()
})

app.post('/Login/', (request, response) => {
	const data = request.body
  var j = unirest.jar()

	account.LoginHandler(unirest, j, {pin: data.pin, password: data.pass,
		school: data.school, locale: data.locale},
		function callback(result, jar) {
      jar.add('Culture=' + data.locale, data.school)
      jar.add('lang=' + data.locale, data.school)

			if(result.success === true) {
				users[data.pin] = {
						pin: data.pin,
						password: data.pass,
						school: data.school,
						locale: data.locale,
						cookies:jar
				}
			}

			response.end(JSON.stringify(result))
	})
})

app.post('/GetRoles/', (request, response) => {
	const data = request.body
	var user = users[data.pin]

	account.GetRolesHandler(unirest, user.cookies, {school:user.school},
		function callback(result, jar) {
			if(result.success === true) {
        users[data.pin].cookies = jar
				response.end(JSON.stringify(result.data))
			}
	})
})

app.post('/LoginWithRole/', (request, response) => {
  const data = request.body
  var user = users[data.pin]

  account.LoginWithRoleHandler(unirest, user.cookies, {school:user.school, role:data.role, password:user.password},
    function callback(result, jar) {
      if(result.success === true) {
        users[data.pin].cookies = jar;
        response.end(JSON.stringify(result))
      }
    })
})

app.get('/', (request, response) => {
	var result = ""
	for(key in users) {
		var obj = users[key]
		result += obj.pin + ' : ' + obj.password + '\n'
	}
	response.end(result)
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
