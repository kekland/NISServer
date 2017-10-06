const express = require('express')
var bodyParser = require('body-parser')
var requester = require('request')
const account = require('./account')

const app = express()
const port = 3000;

const users = {}

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
	account.LoginHandler(requester, {pin: data.pin, password: data.pass,
		school: data.school, locale: data.locale},
		function callback(result) {
			if(result.success === true) {
				users[data.pin] = {
						pin: data.pin,
						password: data.pass,
						school: data.school,
						locale: data.locale,
						cookies:result.cookie
				}
			}
			response.end(JSON.stringify(result))
	})
})
app.post('/GetRoles/', (request, response) => {
	const data = request.body
	var user = users[data.pin]
	account.GetRolesHandler(requester, {school:user.school, locale:user.locale, cookies:user.cookies},
		function callback(result) {
			if(result.success === true) {
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

app.use((err, request, response, next) => {
  // log the error, for now just console.log
  console.log(err)
  response.status(500).send('Server : Error')
})

app.listen(port)
