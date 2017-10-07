const express = require('express')
var bodyParser = require('body-parser')
var unirest = require('unirest')

const account = require('./account')
const login = require('./login')
const app = express()
const port = 3000;

const users = {}

//Body parsers
app.use(bodyParser.urlencoded({ extended: true }));

app.use((request, response, next) => {
  console.log(request.headers)
  next()
})

//Login functions
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

//Public functions
app.post('/FullLogin/', (request, response) => {
  const data = request.body
  var j = unirest.jar()

  login.FullLoginHandler(unirest, {pin: data.pin, pass: data.pass,
		school: data.school, locale: data.locale},
    function callback(result) {
      var time = new Date();
      var timedata =
      ("0" + time.getHours()).slice(-2)   + ":" +
      ("0" + time.getMinutes()).slice(-2) + ":" +
      ("0" + time.getSeconds()).slice(-2);

      users[data.pin] = {
          pin: data.pin,
          password: data.pass,
          school: data.school,
          locale: data.locale,
          cookies:result.CookieJar,
          time:timedata
      }
      response.end(JSON.stringify(result))
    })
})

//Admin functions
app.get('/Users/', (request, response) => {
	var result = ""
  var time = new Date();
  var timedata =
    ("0" + time.getHours()).slice(-2)   + ":" +
    ("0" + time.getMinutes()).slice(-2) + ":" +
    ("0" + time.getSeconds()).slice(-2);

  result += '<html><body><h1> Current Time : ' + timedata + ' </h1><hr>'
	for(key in users) {
		var obj = users[key]
		result += '<h2>' + obj.pin + '</h2>'
    result += '<p>Password: ' + obj.password + '</p>'
    result += '<p>School: ' + obj.school + '</p>'
    result += '<p>Locale: ' + obj.locale + '</p>'
    result += '<p>Time: ' + obj.time + '</p>'
    result += '<hr>'
	}
  result += '</body></html>'
	response.end(result)
})

app.get('/', (request, response) => {
  var text = '<html><body><h2>Welcome to eNIS server</h2>'
  text += '<hr><h3>URLs: </h3>'
  text += '<a href="/Users/">/Users/ : Get users information</a>'

  text += '</body></html>'
  response.end(text)
})

app.use((err, request, response, next) => {
  // log the error, for now just console.log
  console.log(err)
  response.status(500).send('Server : Error')
})

app.listen(port)
