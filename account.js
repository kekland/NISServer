var unirest = require('unirest')

function login(data, listener) {
  var requestData = {
    txtUsername: data.pin,
    txtPassword: data.password
  }
  var jar = unirest.jar()

  var locale
  if(data.locale === undefined) {
    locale = 'en-US'
  }
  else {
    locale = data.locale
  }

  jar.add('Culture=' + locale, data.school)
  jar.add('lang=' + locale, data.school)

  unirest.post(data.school + '/Account/Login')
  .send(requestData)
  .jar(jar)
  .encoding('utf-8')
  .end(function(responseText) {
    var response = responseText.body
    if(response.success === true) {
      listener({success: true, jar: jar})
    }
    else {
      listener({success: false, message: response.ErrorMessage, jar: jar})
    }
  })
}

function getRoles(data, listener) {
  unirest.post(data.school + '/Account/GetRoles')
  .jar(data.jar)
  .encoding('utf-8')
  .end(function(responseText) {
    var response = responseText.body
    if(response.success === true) {
      var role;

      var responseRoles = JSON.stringify(response.listRole)
      if(responseRoles.indexOf('Student') != -1) {
        role = 'Student'
      }
      else if(responseRoles.indexOf('Parent') != -1) {
        role = 'Parent'
      }
      else if(responseRoles.indexOf('Teacher') != -1) {
        role = 'Teacher'
      }
      else {
        listener({
          success: false,
          message: 'No suitable role found',
          roles: response.listRole
        })
        return
      }
      listener({success: true, role: role, roles: response.listRole})
    }
    else {
      listener({success: false, message: response.ErrorMessage})
    }
  })
}

function loginWithRole(data, listener) {
  var requestData = {
    role: data.role,
    password: data.password
  }

  var jar = data.jar
  unirest.post(data.school + '/Account/LoginWithRole')
  .send(requestData)
  .jar(jar)
  .encoding('utf-8')
  .end(function(responseText) {
    var response = responseText.body
    if(response.success === true) {
      listener({success: true, jar: jar})
    }
    else {
      listener({success: false, message: response.ErrorMessage})
    }
  })
}

function getChildren(data, listener) {
  	unirest.post(data.school + '/ImkoDiary/Klasses')
  	.jar(data.jar)
    .encoding('utf-8')
  	.end(function(response) {
  		var responseJSON = response.body
  		if(responseJSON.success === true) {
  				var classData = responseJSON.data
  				for(var i = 0; i < classData.length; i++) {
  					var classID = classData[i].Id
  					var className = classData[i].Name
  					var students = []

  					var requestParams = {
  						klassId: classID,
  						query: ''
  					}
  					var bad = false
  					unirest.post(data.school + '/ImkoDiary/Students')
  					.jar(data.jar)
  					.send(requestParams)
            .encoding('utf-8')
  					.end(function(responseStudents) {
  						var studentsJSON = responseStudents.body
  						if(studentsJSON.success === true) {
  							var studentsData = studentsJSON.data
  							for(var s = 0; s < studentsData.length; s++) {
  								students.push({
  									classID:classID,
  									className:className,
  									studentID:studentsData[s].Id,
  									studentName:studentsData[s].Name
  								})
  							}
  							if(i == classData.length) {
  								listener({
  									success:true,
  									data:students
  								})
  							}
  						}
  						else {
  							if(bad) {return}
  							bad = true
  							listener({
  								success:false,
  								message: studentsJSON.ErrorMessage
  							})
  						}
  					})
  				}
  		}
  		else {
  			listener({
  				success:false,
  				message: responseJSON.ErrorMessage
  			})
  		}
  	})
}

function fullLogin(request, response, listener) {
  var data = request.body
  login({pin: data.pin, password: data.password, school: data.school, locale: data.locale},
    function callback(result) {
      if(result.success === true) {
        var jar = result.jar
        getRoles({school: data.school, jar: jar},
          function callbackRoles(resultRoles) {
            if(resultRoles.success === true) {
              var role = resultRoles.role
              loginWithRole({school: data.school, role: role, jar: jar, password: data.password},
                function callbackLogin(resultLogin) {
                  if(resultLogin.success === true) {
                    var jarFinal = resultLogin.jar
                    if(role == 'Parent') {
                      getChildren({school: data.school, jar: jarFinal},
                        function callbackChildren(resultChildren) {
                          if(resultChildren.success === true) {
                            var endData = {
                              success:true,
                              pin: data.pin,
                              password: data.password,
                              school: data.school,
                              role: role,
                              roles: resultRoles.roles,
                              locale: data.locale,
                              jar: jarFinal,
                              children: resultChildren.data
                            }
                            response.send(JSON.stringify(endData))
                            listener(endData)
                          }
                          else {
                            response.send(JSON.stringify({success:false, message: result.message}))
                          }
                        })
                    }
                    else {
                      var endData = {
                        success:true,
                        pin: data.pin,
                        password: data.password,
                        school: data.school,
                        role: role,
                        roles: resultRoles.roles,
                        locale: data.locale,
                        jar: jarFinal
                      }
                      response.send(JSON.stringify(endData))
                      listener(endData)
                    }
                  }
                  else {
                    response.send(JSON.stringify({success:false, message: result.message}))
                  }
                })
            }
            else {
              response.send(JSON.stringify({success:false, message: result.message}))
            }
          })
      }
      else {
        response.send(JSON.stringify({success:false, message: result.message}))
      }
    })
}


function updateCookies(data, listener) {
  login({pin: data.pin, password: data.password, school: data.school, locale: data.locale},
    function callback(result) {
      if(result.success === true) {
        var jar = result.jar
        getRoles({school: data.school, jar: jar},
          function callbackRoles(resultRoles) {
            if(resultRoles.success === true) {
              var role = resultRoles.role
              loginWithRole({school: data.school, role: role, jar: jar, password: data.password},
                function callbackLogin(resultLogin) {
                  if(resultLogin.success === true) {
                    var jarFinal = resultLogin.jar
                      var endData = {
                        success:true,
                        pin: data.pin,
                        password: data.password,
                        school: data.school,
                        role: role,
                        roles: resultRoles.roles,
                        locale: data.locale,
                        jar: jarFinal
                      }
                      listener(endData)
                  }
                  else {
                    listener({success:false, message: result.message})
                  }
                })
            }
            else {
              listener({success:false, message: result.message})
            }
          })
      }
      else {
        listener({success:false, message: result.message})
      }
    })
}
module.exports.fullLogin = fullLogin
module.exports.updateCookies = updateCookies
