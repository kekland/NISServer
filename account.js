function LoginHandler(requester, jar, data, listener) {

	var requestData = {
		txtUsername: data.pin,
		txtPassword: data.password
	}

	requester.post(data.school + '/Account/Login')
		.send(requestData)
		.jar(jar)
		.end(function (response) {
			var jsonResponse = response.body
			if(jsonResponse.success === true) {
				listener({success: true}, jar)
			}
			else {
				listener({success: false, message: jsonResponse.ErrorMessage}, jar)
			}
		})
}
function GetRolesHandler(requester, jar, data, listener) {

	requester.post(data.school + '/Account/GetRoles/')
	.jar(jar)
	.end(function (response) {
		var responseJSON = response.body
		if(responseJSON.success === true) {
			listener({
				success:true,
				data: responseJSON
			}, jar)
		}
		else {
			listener({
				success: false,
				message: responseJSON.ErrorMessage
			}, jar)
		}
	})
}
function LoginWithRoleHandler(requester, jar, data, listener) {
	var requestData = {
		role: data.role,
		password: data.password
	}

	requester.post(data.school + '/Account/LoginWithRole/')
	.send(requestData)
	.jar(jar)
	.end(function (response) {
		var responseJSON = response.body
		if(responseJSON.success === true) {
			listener({
				success:true
			}, jar)
		}
		else {
			listener({
				success: false,
				message: responseJSON.ErrorMessage
			}, jar)
		}
	})
}

module.exports.LoginHandler = LoginHandler
module.exports.GetRolesHandler = GetRolesHandler
module.exports.LoginWithRoleHandler = LoginWithRoleHandler
