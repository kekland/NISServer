function LoginHandler(requester, data, listener) {

	var requestData = JSON.stringify({
		txtUsername: data.pin,
		txtPassword: data.password
	})
	var cookies = 'Culture=' + data.locale + ';';

	var headers = {
		'Content-Type': 'application/json',
		'Content-Length': Buffer.byteLength(requestData),
		'Cookie': cookies
	}

	var options = {
		url: data.school + '/Account/Login/',
		method: 'POST',
		headers: headers,
		body: requestData
	}

	requester.post(options, function callback(error, response, body) {
		if(error) {
			listener({
				success: false,
				message: error.toString()
			})
		}

		var responseJSON = JSON.parse(response.body)
		if(responseJSON.success === true) {
			listener({
				success:true,
				cookie:response.headers['set-cookie']
			})
		}
		else {
			listener({
				success: false,
				message: responseJSON.ErrorMessage
			})
		}
	})
}
function GetRolesHandler(requester, data, listener) {
	var cookies = 'Culture=' + data.locale + ';';

	var headers = {
		'Content-Type': 'application/json',
		'Cookie': data.cookies
	}

	var options = {
		url: data.school + '/Account/GetRoles/',
		method: 'POST',
		headers: headers
	}

	requester.post(options, function callback(error, response, body) {
		if(error) {
			listener({
				success: false,
				message: error.toString()
			})
		}

		var responseJSON = JSON.parse(response.body)
		if(responseJSON.success === true) {
			listener({
				success:true,
				cookie:response.headers['set-cookie'],
				listRole: JSON.stringify(responseJSON)
			})
		}
		else {
			listener({
				success: false,
				message: responseJSON.ErrorMessage
			})
		}
	})
}
module.exports.LoginHandler = LoginHandler
module.exports.GetRolesHandler = GetRolesHandler
