# NISServer
# URLs
Base URL is <code>https://nis-api.herokuapp.com/</code>
## Account
### /GetData/ ### 
Get all information about requested user.

_Query_ :
- _pin_ : Personal Identification Number
- _password_ : Password
- _school_ : School ID (List of IDs and consecutive URLs are below)
- _locale_ : User locale (Optional - default is en-US)

_There are three locales available : ru-RU, kk-KZ, en-US_

#### Sample response : ####
```
- {success: true, pin: "123456789123", password: "SamplePassword", 
  school: "http://fmalm.nis.edu.kz/Almaty_Fmsh", schoolID: "almaty_phmd",
  role: "Student", roles: [{value: "Student", text: "Ученик"}, {value: "Teacher", text: "Учитель"}],
  locale: "ru-RU"}
  
- {success: true, pin: "123456789123", password: "SamplePassword", 
  school: "http://fmalm.nis.edu.kz/Almaty_Fmsh", schoolID: "almaty_phmd",
  role: "Student", roles: [{value: "Student", text: "Ученик"}, {value: "Teacher", text: "Учитель"}],
  locale: "ru-RU", children: [{class: {id: "1", name: "10-B"}, student: {id: ""2", name: "Какое-то имя"}}]}

- {success: false, message: "Incorrect username or password"}
  
```

### /CheckCredentials/ ### 
Check user credentials, does not require and grant authentication

_Query_ :
- _pin_ : Personal Identification Number
- _password_ : Password
- _school_ : School ID (List of IDs and consecutive URLs are below)
- _locale_ : User locale (Optional - default is en-US)

_There are three locales available : ru-RU, kk-KZ, en-US_

#### Sample response : ####
```
- {success: true}

- {success: false}
  
```

## Subjects
### /GetSubjectData/ ###

Will respond with subject information for all 4 quarters.

_Query_ :
- _pin_ : Personal Identification Number
- _password_ : Password
- _school_ : School ID (List of IDs and consecutive URLs are below)
- _locale_ : User locale (Optional - default is en-US)

#### Sample response : ####
```

//If user role was Student, then childID will be set to 'null'
//IMKO : Student
- [{childID: 'null', data: [{quarter:"1", data: [{id: "12", name: "English", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}, 
  {quarter:"2", data: [{id: "12", name: "Geography", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}, 
  {quarter:"3", data: [{id: "12", name: "Kazakh History", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}, 
  {quarter:"4", data: [{id: "12", name: "Russian Language", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}]}]
  
//JKO : Student
- [{childID: 'null', data: [
    {quarter:"1", data: [{id: "a-b-c-d", name: "English", grade: "5", percent: "85", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]}, 
    {quarter:"2", data: [{id: "a-b-c-d", name: "Kazakh Literature", grade: "", percent: "0", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]}, 
    {quarter:"3", data: [{id: "a-b-c-d", name: "Self-Knowledge", grade: "", percent: "0"}]}, 
    {quarter:"4", data: [{id: "a-b-c-d", name: "English", grade: "5", percent: "85", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]}]}]
    
//In parent role: if there are multiple children, then response will have subject data for all children. 
//IMKO : Parent
- [{childID: '123', data: [{quarter:"1", data: [{id: "12", name: "English", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}, 
  {quarter:"2", data: [{id: "12", name: "Geography", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}, 
  {quarter:"3", data: [{id: "12", name: "Kazakh History", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}, 
  {quarter:"4", data: [{id: "12", name: "Russian Language", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}]},
  
  {childID: '255', data: [{quarter:"1", data: [{id: "12", name: "English", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}, 
  {quarter:"2", data: [{id: "12", name: "Geography", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}, 
  {quarter:"3", data: [{id: "12", name: "Kazakh History", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}, 
  {quarter:"4", data: [{id: "12", name: "Russian Language", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}]}]

//JKO : Parent
- [{childID: '123', data: [
    {quarter:"1", data: [{id: "a-b-c-d", name: "English", grade: "5", percent: "85", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]}, 
    {quarter:"2", data: [{id: "a-b-c-d", name: "Kazakh Literature", grade: "", percent: "0", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]}, 
    {quarter:"3", data: [{id: "a-b-c-d", name: "Self-Knowledge", grade: "", percent: "0"}]}, 
    {quarter:"4", data: [{id: "a-b-c-d", name: "English", grade: "5", percent: "85", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]}]},
    
    {childID: '255', data: [
    {quarter:"1", data: [{id: "a-b-c-d", name: "English", grade: "5", percent: "85", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]}, 
    {quarter:"2", data: [{id: "a-b-c-d", name: "Kazakh Literature", grade: "", percent: "0", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]}, 
    {quarter:"3", data: [{id: "a-b-c-d", name: "Self-Knowledge", grade: "", percent: "0"}]}, 
    {quarter:"4", data: [{id: "a-b-c-d", name: "English", grade: "5", percent: "85", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]}]}]
```

## Goals
### /GetGoals/ ###
Gets IMKO goals, requires authentication and cookie

_Query_ :
- _pin_ : Personal Identification Number
- _password_ : Password
- _school_ : School ID (List of IDs and consecutive URLs are below)
- _locale_ : User locale (Optional - default is en-US)
- _diary_ : Diary (Either IMKO or JKO)

_Required query if diary is IMKO :_
- _studentID_ : ID of student, leave blank if user role is Student
- _subjectID_ : ID of subject 
- _quarterID_ : ID of quarter (1 - 4)

_Reqiuired query if diary is JKO:_
- _topicEvaluationID_ : ID of topic evaluation
- _quarterEvaluationID_ : ID of quarter evaluation
- _journalID_ : Journal ID of subject

#### Sample response : ####
```
//IMKO
- {success: true, goals: [{index: "0", text: "Algebra", data: [{id: "13", name: "1.1.1", description: "Know something", status: "Achieved", statusCode: "1", comment: "", changedDate: "01.01.2017}]}], homework: [{description: "Do something", date: "01.01.2017", files:[{name: "Kazakh culture in 2017.pptx", url: "fmalm.nis.edu.kz/DownloadURL/blahblah.pptx"}]}]} 

- {success: true, goals: [{index: "0", text: "Algebra", data: [{id: "13", name: "1.1.1", description: "Know something", status: "Achieved", statusCode: "1", comment: "", changedDate: "01.01.2017}]}], homework: []} 
  
//JKO
- {success: true, data: [{name: "Do something", topic: {score: "15", maxScore: "15"}, quarter: {score: "15", maxScore: "15"}}]} 

- {success: true, data: [{name: "Do something", topic: {score: "0" maxScore: "15"}, quarter: {score: "0", maxScore: "15"}}]} 

//Error
- {success: false, message: "Some kind of an error occurred"}
```

## School IDs and consecutive URLs
```
  aktau_cbd = http://akt.nis.edu.kz/Aktau
  aktobe_phmd = http://akb.nis.edu.kz/Aktobe
  almaty_phmd = http://fmalm.nis.edu.kz/Almaty_Fmsh
  almaty_cbd = http://hbalm.nis.edu.kz/Almaty_Hbsh
  astana_phmd = http://ast.nis.edu.kz/Astana_Fmsh
  atyrau_cbd = http://atr.nis.edu.kz/Atyrau
  karaganda_cbd = http://krg.nis.edu.kz/Karaganda
  kokshetau_phmd = http://kt.nis.edu.kz/Kokshetau
  kostanay_phmd = http://kst.nis.edu.kz/Kostanay
  kyzylorda_cbd = http://kzl.nis.edu.kz/Kyzylorda
  pavlodar_cbd = http://pvl.nis.edu.kz/Pavlodar
  petropavlovsk_cbd = http://ptr.nis.edu.kz/Petropavlovsk
  semey_phmd = http://sm.nis.edu.kz/Semey_FMSH
  taldykorgan_phmd = http://tk.nis.edu.kz/Taldykorgan
  taraz_phmd = http://trz.nis.edu.kz/Taraz
  uralsk_phmd = http://ura.nis.edu.kz/Uralsk
  oskemen_cbd = http://ukk.nis.edu.kz/Oskemen
  shymkent_phmd = http://fmsh.nis.edu.kz/Shymkent_Fmsh
  shymkent_cbd = http://hbsh.nis.edu.kz/Shymkent_Hbsh
```
When passing School as parameter you should pass ID instead of URL. It will be converted to URL automatically.



## Methods below are deprecated, please, consider using /GetSubjectData/ instead
### /IMKO/GetIMKOSubjects/ ### 
Gets IMKO subjects, requires authentication and cookie

_Query_ :
- _childID_ : ID of child - leave blank if user role is not parent

#### Sample response : ####
```
- {success: true, data: [
  {quarter:"1", data: [{id: "12", name: "English", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}, 
  {quarter:"2", data: [{id: "12", name: "Geography", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}, 
  {quarter:"3", data: [{id: "12", name: "Kazakh History", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}, 
  {quarter:"4", data: [{id: "12", name: "Russian Language", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}]} 

- {success: true, data: [{quarter: "1", data: []}, {quarter: "2", data: []}, {quarter: "3", data: []}, {quarter: "4", data: []}]}

- {success: false, message: "Some kind of an error occurred"}
```

### /IMKO/GetIMKOSubjectsForQuarter/ ### 
Gets IMKO subjects for selected quarter, requires authentication and cookie

_Query_ :
- _childID_ : ID of child - leave blank if user role is not parent
- _quarter_ : ID of quarter (from 1 to 4)

#### Sample response : ####
```
- {success: true, data: [{id: "12", name: "English", formative: {current: "15", maximum: "15"}, summative: {current: "25", maximum: "25"}, grade: "5", lastChanged: "24.05.17"}]}
  
- {success: true, data: []}

- {success: false, message: "Some kind of an error occurred"}
```

### /JKO/GetJKOSubjects/ ### 
Gets JKO subjects, requires authentication and cookie

_Query_ :
- _childID_ : ID of child - leave blank if user role is not parent
- _classID_ : ID of class - leave blank if user role is not parent

#### Sample response : ####
```
// Be aware that in non-assessed lessons like Self-Knowledge you will not recieve topicEvaluationID and quarterEvaluationID
- {success: true, data: [
    {quarter:"1", data: [{id: "a-b-c-d", name: "English", grade: "5", percent: "85", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]}, 
    {quarter:"2", data: [{id: "a-b-c-d", name: "Kazakh Literature", grade: "", percent: "0", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]}, 
    {quarter:"3", data: [{id: "a-b-c-d", name: "Self-Knowledge", grade: "", percent: "0"}]}, 
    {quarter:"4", data: [{id: "a-b-c-d", name: "English", grade: "5", percent: "85", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]}]} 

  
- {success: false, message: "Some kind of an error occurred"}
```

### /JKO/GetJKOSubjectsForQuarter/ ### 
Gets JKO subjects for selected quarter, requires authentication and cookie

_Query_ :
- _quarterID_ : ID of quarter (from 1 to 4)
- _childID_ : ID of child - leave blank if user role is not parent
- _classID_ : ID of class - leave blank if user role is not parent

#### Sample response : ####
```
// Be aware that in non-assessed lessons like Self-Knowledge you will not recieve topicEvaluationID and quarterEvaluationID

- {success: true, data: [{id: "a-b-c-d", name: "English", grade: "5", percent: "85", topicEvaluationID: "a-b-c-d-e", quarterEvaluationID: "a-b-c-d-e-f"}]} 

  
- {success: false, message: "Some kind of an error occurred"}
```
