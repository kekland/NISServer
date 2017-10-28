let requester = require('./requester')
let unirest = require('unirest')
function login(data) { 
  return new Promise((resolve, reject) => {
    let requestData = {
      txtUsername: data.pin,
      txtPassword: data.password
    }
    let jar = unirest.jar()
  
    jar.add('Culture=' + data.locale, data.school)
    jar.add('lang=' + data.locale, data.school)
  
    let params = {
      requestParams: requestData,
      url: data.school + '/Account/Login',
      jar: jar
    }

    requester.request(params, (err, result) => {
      if(err != null) {
        reject(err)
        return
      }

      let response = result.response
      if(response.success === true) {
        resolve({success: true, jar: result.jar})
      }
      else {
        reject({success: false, message: response.message})
      }
    })
  })
}

function getRoles(data) {
  return new Promise((resolve, reject) => {
    let params = {
      requestParams: '',
      url: data.school + '/Account/GetRoles',
      jar: data.jar
    }
    requester.request(params, (err, result) => {
      if(err != null) {
        reject(err)
        return
      }

      let response = result.response
      if (response.success === true) {
        let role = undefined
  
        let responseRoles = JSON.stringify(response.listRole)
        if (responseRoles.indexOf('Student') != -1) {
          role = 'Student'
        } else if (responseRoles.indexOf('Parent') != -1) {
          role = 'Parent'
        } else if (responseRoles.indexOf('Teacher') != -1) {
          role = 'Teacher'
        } else {
          role = response.listRole[0].value
        }
  
        resolve({
          success: true,
          role: role,
          roles: response.listRole
        })
      } else {
        reject({
          success: false,
          message: response.ErrorMessage
        })
      }
    })
  })
}

function loginWithRole(data) {
  return new Promise((resolve, reject) => {
    let requestData = {
      role: data.role,
      password: data.password
    }
  
    let jar = data.jar
    let params = {
      url: data.school + '/Account/LoginWithRole',
      requestParams: requestData,
      jar: jar
    }
  
    requester.request(params, (err, result) => {
      if(err != null) {
        reject(err)
        return
      }

      let response = result.response
      if (response.success === true) {
        resolve({
          success: true,
          jar: jar
        })
      } else {
        reject({
          success: false,
          message: response.ErrorMessage
        })
      }
    })
  })
}

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

function getStudents(data) {
  return new Promise((resolve, reject) => {
    let students = []

    let requestParams = {
      url: data.school + '/ImkoDiary/Students',
      requestParams: {
        klassId: data.class.id,
        query: ''
      },
      jar: data.jar
    }

    requester.request(requestParams, (err, result) => {
      if(err != null) {
        reject(err)
        return
      }
      
      let response = result.response
      if(response.success === true) {
        let studentsData = response.data

        for (let student of studentsData) {
          students.push({
            class: data.class,
            student: {
              id: student.Id,
              name: student.Name
            }
          })
        }

        resolve({success: true, students: students})
      }
      else {
        reject({
          success: false,
          message: studentsJSON.ErrorMessage
        })
      }
    })
  })
}

function getClassData(data) {
  return new Promise((resolve, reject) => {
    let classes = []

    let params = {
      jar: data.jar,
      url: data.school + '/ImkoDiary/Klasses',
      requestParams: ''
    }
    
    requester.request(params, (err, result) => {
      if(err != null) {
        reject(err)
        return
      }

      let response = result.response
      if(response.success === true) {
        for(let classObject of response.data) {
          classes.push({
            id: classObject.Id,
            name: classObject.Name
          })
        }

        resolve({success: true, classes: classes})
      }
      else {
        reject({
          success: false,
          message: response.ErrorMessage
        })
      }
    })
  })
}
function getChildren(data, callback) {
  let children = []

  getClassData(data)
    .then(result => {
      let promiseChain = []
      for(let classObject of result.classes) {
        let classData = data
        classData.class = classObject

        promiseChain.push(getStudents(classData))
      }

      return Promise.all(promiseChain)
    })
    .then(values => {
      for(let response of values) {
        for(let student of response.students) {
          children.push(student)
        }
      }
      callback(null, {success: true, data: children})
    })
    .catch(error => {
      callback(error, null)
    })
}

function getCookies(data) {
  return new Promise((resolve, reject) => {
    let locale = 'ru-RU'
    //kk-KZ, ru-RU, en-US
    if (data.locale !== undefined) {
      locale = data.locale
    }
  
    let schoolID = data.schoolID
    let school = null
    for(key in schoolConvert) {
      if(key == data.school) {
        school = schoolConvert[data.school]
        break;
      }
    }
  
    if(school === null) {
      reject({success:false, message:'School must be in form of ID. You can find list in https://github.com/kekland/NISServer', errorCode: '2'})
      return
    }
  
    let requestBody = {pin: data.pin, password: data.password, school: school, locale: locale}
  
    login(requestBody)
      .then(response => {
        requestBody.jar = response.jar
        return getRoles(requestBody)
      })
      .then(response => {
        requestBody.role = response.role
        return loginWithRole(requestBody)
      })
      .then(response => {
        resolve({success: true, jar: response.jar, school: school})
      })
      .catch(error => {
        reject(error)
      })
  })
}

function checkCredentials(data) {
  return new Promise((resolve, reject) => {
    let locale = 'ru-RU'
    //kk-KZ, ru-RU, en-US
    if (data.locale !== undefined) {
      locale = data.locale
    }
  
    let schoolID = data.schoolID
    let school = null
    for(key in schoolConvert) {
      if(key == data.school) {
        school = schoolConvert[data.school]
        break;
      }
    }
  
    if(school === null) {
      reject({success:false, message:'School must be in form of ID. You can find list in https://github.com/kekland/NISServer', errorCode: '2'})
      return
    }
  
    let requestBody = {pin: data.pin, password: data.password, school: school, locale: locale}
  
    login(requestBody)
      .then(response => {
        resolve({success: true})
      })
      .catch(error => {
        reject(error)
      })
  })
}

function getData(data) {
  return new Promise((resolve, reject) => {
    let locale = 'ru-RU'
    //kk-KZ, ru-RU, en-US
    if (data.locale !== undefined) {
      locale = data.locale
    }
  
    let schoolID = data.schoolID
    let school = null
    for(key in schoolConvert) {
      if(key == data.school) {
        school = schoolConvert[data.school]
        break;
      }
    }
  
    if(school === null) {
      reject({success:false, message:'School must be in form of ID. You can find list in https://github.com/kekland/NISServer', errorCode: '2'})
      return
    }
  
    let requestBody = {pin: data.pin, password: data.password, school: school, locale: locale}
  
    let result = {}
    login(requestBody)
      .then(response => {
        requestBody.jar = response.jar
  
        result.pin = data.pin
        result.password = data.password
        result.school = school
        result.schoolID = schoolID
        result.locale = locale
  
        return getRoles(requestBody)
      })
      .then(response => {
        requestBody.role = response.role  
  
        result.role = response.role
        result.roles = response.roles
  
        return loginWithRole(requestBody)
      })
      .then(response => {
        requestBody.jar = response.jar
        result.jar = response.jar
        if(requestBody.role === 'Parent') {
          getChildren(requestBody, (err, childrenResponse) => {
            if(err) {
              reject(err)
              return
            }
            result.children = childrenResponse.data
            result.success = true
            resolve(result)
          })      
        }
        else {
          result.success = true
          resolve(result)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}

module.exports.getData = getData
module.exports.checkCredentials = checkCredentials
module.exports.getCookies = getCookies