# NISServer
## URLs
### Account
#### /FullLogin/ #### 
Log in to system - this request authenticates user to system and allows to use other requests

_Query_ :
- _pin_ : Personal Identification Number
- _pass_ : Password
- _school_ : School URL (List of URLs are below)
- _locale_ : User locale 

_There are three locales available : ru-RU, kk-KZ, en-US_

#### /CheckCredentials/ #### 
Check user credentials, does not require and grant authentication

_Query_ :
- _pin_ : Personal Identification Number
- _pass_ : Password
- _school_ : School URL (List of URLs are below)
- _locale_ : User locale 

_There are three locales available : ru-RU, kk-KZ, en-US_

#### /GetChildren/ #### 
Gets children of user. User's Role must be Parent in order to get children.

Also, you should be authenticated to use this request.

_Query_ :
- _pin_ : Personal Identification Number
- _pass_ : Password

### Subjects
#### /GetIMKOSubjects/ #### 
Gets IMKO subjects, requires authentication

_Query_ :
- _pin_ : Personal Identification Number
- _pass_ : Password
- _childID_ : ID of child - leave blank if user role is not parent

#### /GetIMKOSubjectsForQuarter/ #### 
Gets IMKO subjects for selected quarter, requires authentication

_Query_ :
- _pin_ : Personal Identification Number
- _pass_ : Password
- _childID_ : ID of child - leave blank if user role is not parent
- _quarter_ : ID of quarter (from 1 to 4)

#### /GetJKOSubjects/ #### 
Gets JKO subjects, requires authentication

_Query_ :
- _pin_ : Personal Identification Number
- _pass_ : Password
- _childID_ : ID of child - leave blank if user role is not parent
- _classID_ : ID of class - leave blank if user role is not parent

#### /GetJKOSubjectsForQuarter/ #### 
Gets JKO subjects for selected quarter, requires authentication

_Query_ :
- _pin_ : Personal Identification Number
- _pass_ : Password
- _quarterID_ : ID of quarter (from 1 to 4)
- _childID_ : ID of child - leave blank if user role is not parent
- _classID_ : ID of class - leave blank if user role is not parent

### Goals
**/GetIMKOGoals/** - Get goals and homework (IMKO)

**/GetJKOGoals/** - Get goals (JKO)
