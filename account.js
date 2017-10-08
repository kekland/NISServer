var unirest = require('unirest')

var uuid = require('uuid/v1')

var schoolConvert = {
  'aktau_cbd' : 'http://akt.nis.edu.kz/Aktau',
  'aktobe_phmd' : 'http://akb.nis.edu.kz/Aktobe',
  'almaty_phmd' : 'http://fmalm.nis.edu.kz/Almaty_Fmsh',
  'almaty_cbd' : 'http://hbalm.nis.edu.kz/Almaty_Hbsh',
  'astana_phmd' : 'http://ast.nis.edu.kz/Astana_Fmsh',
  'atyrau_cbd' : 'http://atr.nis.edu.kz/Atyrau',
  'karaganda_cbd' : 'http://krg.nis.edu.kz/Karaganda',
  'kokshetau_phmd' : 'http://kt.nis.edu.kz/Kokshetau',
  'kostanay_phmd' : 'http://kst.nis.edu.kz/Kostanay',
  'kyzylorda_cbd' : 'http://kzl.nis.edu.kz/Kyzylorda',
  'pavlodar_cbd' : 'http://pvl.nis.edu.kz/Pavlodar',
  'petropavlovsk_cbd' : 'http://ptr.nis.edu.kz/Petropavlovsk',
  'semey_phmd' : 'http://sm.nis.edu.kz/Semey_FMSH',
  'taldykorgan_phmd' : 'http://tk.nis.edu.kz/Taldykorgan',
  'taraz_phmd' : 'http://trz.nis.edu.kz/Taraz',
  'uralsk_phmd' : 'http://ura.nis.edu.kz/Uralsk',
  'oskemen_cbd' : 'http://ukk.nis.edu.kz/Oskemen',
  'shymkent_phmd' : 'http://fmsh.nis.edu.kz/Shymkent_Fmsh',
  'shymkent_cbd' : 'http://hbsh.nis.edu.kz/Shymkent_Hbsh'
}

function login(data, listener) {
  var requestData = {
    txtUsername: data.pin,
    txtPassword: data.password
  }
  var jar = unirest.jar()

  var locale
  if (data.locale === undefined) {
    locale = 'en-US'
  } else {
    locale = data.locale
  }

  jar.add('Culture=' + locale, data.school)
  jar.add('lang=' + locale, data.school)

  unirest.post(data.school + '/Account/Login')
    .send(requestData)
    .jar(jar)
    .encoding('utf-8')
    .end(function(responseText) {
      if (responseText.statusType == 2) {
        var response = responseText.body
        if (response.success === true) {
          listener({
            success: true,
            jar: jar
          })
        } else {
          listener({
            success: false,
            message: response.ErrorMessage,
            jar: jar
          })
        }
      } else {
        listener({
          success: false,
          message: 'No connection to server'
        })
      }
    })
}

function getRoles(data, listener) {
  unirest.post(data.school + '/Account/GetRoles')
    .jar(data.jar)
    .encoding('utf-8')
    .end(function(responseText) {
      if (responseText.statusType == 2) {
        var response = responseText.body
        if (response.success === true) {
          var role;

          var responseRoles = JSON.stringify(response.listRole)
          if (responseRoles.indexOf('Student') != -1) {
            role = 'Student'
          } else if (responseRoles.indexOf('Parent') != -1) {
            role = 'Parent'
          } else if (responseRoles.indexOf('Teacher') != -1) {
            role = 'Teacher'
          } else {
            role = response.listRole[0].value
          }
          listener({
            success: true,
            role: role,
            roles: response.listRole
          })
        } else {
          listener({
            success: false,
            message: response.ErrorMessage
          })
        }
      } else {
        listener({
          success: false,
          message: 'No connection to server'
        })
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
      if (responseText.statusType == 2) {
        var response = responseText.body
        if (response.success === true) {
          listener({
            success: true,
            jar: jar
          })
        } else {
          listener({
            success: false,
            message: response.ErrorMessage
          })
        }
      } else {
        listener({
          success: false,
          message: 'No connection to server'
        })
      }
    })
}

function getChildren(data, listener) {
  unirest.post(data.school + '/ImkoDiary/Klasses')
    .jar(data.jar)
    .encoding('utf-8')
    .end(function(response) {
      if (response.statusType == 2) {
        var responseJSON = response.body
        if (responseJSON.success === true) {
          var classData = responseJSON.data
          for (var i = 0; i < classData.length; i++) {
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
                if (studentsJSON.success === true) {
                  var studentsData = studentsJSON.data
                  for (var s = 0; s < studentsData.length; s++) {
                    students.push({
                      classID: classID,
                      className: className,
                      studentID: studentsData[s].Id,
                      studentName: studentsData[s].Name
                    })
                  }
                  if (i == classData.length) {
                    listener({
                      success: true,
                      data: students
                    })
                  }
                } else {
                  if (bad) {
                    return
                  }
                  bad = true
                  listener({
                    success: false,
                    message: studentsJSON.ErrorMessage
                  })
                }
              })
          }
        } else {
          listener({
            success: false,
            message: responseJSON.ErrorMessage
          })
        }
      } else {
        listener({
          success: false,
          message: 'No connection to server'
        })
      }
    })
}

function fullLogin(request, response, listener) {
  var data = request.body
  var school = '-1'
  for(key in schoolConvert) {
    if(key == data.school) {
      school = schoolConvert[data.school]
      break;
    }
  }
  if(school == '-1') {
    listener({success:false, message:'School must be in form of ID. You can find list in https://github.com/kekland/NISServer'})
    return
  }

  login({
      pin: data.pin,
      password: data.password,
      school: school,
      locale: data.locale
    },
    function callback(result) {
      if (result.success === true) {
        var jar = result.jar
        getRoles({
            school: school,
            jar: jar
          },
          function callbackRoles(resultRoles) {
            if (resultRoles.success === true) {
              var role = resultRoles.role
              loginWithRole({
                  school: school,
                  role: role,
                  jar: jar,
                  password: data.password
                },
                function callbackLogin(resultLogin) {
                  if (resultLogin.success === true) {
                    var jarFinal = resultLogin.jar
                    if (role == 'Parent') {
                      getChildren({
                          school: school,
                          jar: jarFinal
                        },
                        function callbackChildren(resultChildren) {
                          if (resultChildren.success === true) {
                            var uniqueID = uuid()
                            response.cookie('loginID', uniqueID, {maxAge: 900000, httpOnly: true})

                            var endData = {
                              success: true,
                              id: uniqueID,
                              pin: data.pin,
                              password: data.password,
                              school: school,
                              schoolID: data.school,
                              role: role,
                              roles: resultRoles.roles,
                              locale: data.locale,
                              jar: jarFinal,
                              children: resultChildren.data
                            }
                            response.send(JSON.stringify(endData))
                            listener(endData)
                          } else {
                            response.send(JSON.stringify({
                              success: false,
                              message: result.message
                            }))
                          }
                        })
                    } else {
                      var uniqueID = uuid()
                      response.cookie('loginID', uniqueID, {maxAge: 900000, httpOnly: true})

                      var endData = {
                        success: true,
                        id: uniqueID,
                        pin: data.pin,
                        password: data.password,
                        school: school,
                        schoolID: data.school,
                        role: role,
                        roles: resultRoles.roles,
                        locale: data.locale
                      }
                      response.send(JSON.stringify(endData))
                      endData.jar = jarFinal
                      listener(endData)
                    }
                  } else {
                    response.send(JSON.stringify({
                      success: false,
                      message: result.message
                    }))
                  }
                })
            } else {
              response.send(JSON.stringify({
                success: false,
                message: result.message
              }))
            }
          })
      } else {
        response.send(JSON.stringify({
          success: false,
          message: result.message
        }))
      }
    })
}

function updateCookies(data, listener) {
  login({
      pin: data.pin,
      password: data.password,
      school: data.school,
      locale: data.locale
    },
    function callback(result) {
      if (result.success === true) {
        var jar = result.jar
        getRoles({
            school: data.school,
            jar: jar
          },
          function callbackRoles(resultRoles) {
            if (resultRoles.success === true) {
              var role = resultRoles.role
              loginWithRole({
                  school: data.school,
                  role: role,
                  jar: jar,
                  password: data.password
                },
                function callbackLogin(resultLogin) {
                  if (resultLogin.success === true) {
                    var jarFinal = resultLogin.jar
                    var endData = {
                      success: true,
                      pin: data.pin,
                      password: data.password,
                      school: data.school,
                      role: role,
                      roles: resultRoles.roles,
                      locale: data.locale,
                      jar: jarFinal
                    }
                    listener(endData)
                  } else {
                    listener({
                      success: false,
                      message: result.message
                    })
                  }
                })
            } else {
              listener({
                success: false,
                message: result.message
              })
            }
          })
      } else {
        listener({
          success: false,
          message: result.message
        })
      }
    })
}

function checkCredentials(request, response) {
  var data = request.body
  login(data, function(result) {
    if (result.success === true) {
      response.send(JSON.stringify({
        success: true
      }))
    } else {
      response.send(JSON.stringify({
        success: false
      }))
    }
  })
}

module.exports.fullLogin = fullLogin
module.exports.updateCookies = updateCookies
