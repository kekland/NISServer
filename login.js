var account = require('./account')
function FullLoginHandler(requester, data, listener) {
  var j = requester.jar()

  var pin = data.pin
  var pass = data.pass
  var url = data.school
  var locale = data.locale

  j.add('Culture=' + locale, url)
  j.add('lang=' + locale, url)

  account.LoginHandler(requester, j, {pin: pin, password: pass,
		school: url},
		function callback(result, jar) {
      jar.add('Culture=' + locale, url)
      jar.add('lang=' + locale, url)

			if(result.success === true) {
        account.GetRolesHandler(requester, jar, {school: url},
        function callbackRoles(resultRoles, jarRoles) {
          if(resultRoles.success === true) {
            var role;
            var jsonString = JSON.stringify(resultRoles)
            var ok;
            if(jsonString.indexOf('Student') != -1) {
              role = 'Student'
            }
            else if(jsonString.indexOf('Parent') != -1) {
              role = 'Parent'
            }
            else if(jsonString.indexOf('Teacher') != -1) {
              role = 'Teacher'
            }
            else {
              listener({
                LoginSuccess:true,
                GetRolesSuccess:false,
                FinalLoginSuccess:false,
                ErrorMessage: 'No suitable role found'
              })
              return
            }
            account.LoginWithRoleHandler(requester, jarRoles,
              {school:url, role:role, password:pass},
              function callbackFinal(resultFinal, jarFinal) {
                if(resultFinal.success === true) {
                    listener(
                      {
                        LoginSuccess:true,
                        GetRolesSuccess:true,
                        FinalLoginSuccess: true,
                        ErrorMessage: '',
                        SelectedRole: role,
                        CookieJar: jarFinal
                      })
                }
                else {
                  listener(
                    {
                      LoginSuccess:true,
                      GetRolesSuccess:true,
                      FinalLoginSuccess: false,
                      ErrorMessage: resultFinal.message
                    })
                }
              })
          }
          else {
            listener(
              {
                LoginSuccess:true,
                GetRolesSuccess:false,
                FinalLoginSuccess: false,
                ErrorMessage: resultRoles.message
              })
          }
        })
			}
      else {
        listener(
          {
            LoginSuccess:false,
            GetRolesSuccess:false,
            FinalLoginSuccess: false,
            ErrorMessage: result.message
          })
      }
	})
}

module.exports.FullLoginHandler = FullLoginHandler
