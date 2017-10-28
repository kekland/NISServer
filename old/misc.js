var unirest = require('unirest')

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

function getPasswordStrength (request, response) {
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

  unirest.post(school + '/Account/GetPassStrength')
  .send({pass: data.password})
  .end(function (result) {
    if (result.statusType === 2) {
      response.send({strength: result.body})
    }
  })
}

module.exports.getPasswordStrength = getPasswordStrength
