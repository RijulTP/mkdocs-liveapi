# Introduction:

[VOI](https://voi.com) is a Swedish ride sharing company focused on electric scooters. They have scooters placed in several cities and countries around the world, including Sweden, Spain, Italy, France and more.

Base url of the API is `https://api.voiapp.io/`


# Authentication:
The API requires an **Access Token**. This token is valid for only a short time (10 minutes I think, I haven't tried to measure). You get the **Access Token** by opening a session. You need an **Authentication Token** to open a session. When opening a session, you get: 
* an **Access Token** that you can use in the next 10 minutes or so to query data
* a new **Authentication Token** to open the next session

To get the first Authentication Token, see steps 1,2,3 below. 

Python Script to easely obtain your token: [https://gist.github.com/BastelPichi/b084aa5260331424735fadc3b8e1719d](https://gist.github.com/BastelPichi/b084aa5260331424735fadc3b8e1719d)

See here example of python implementation of the session authentication (once the step 1-2-3 are done): [https://github.com/hawisizu/scooter_scrapper/blob/master/providers/voi.py](https://github.com/hawisizu/scooter_scrapper/blob/master/providers/voi.py)

## 1 - Get OTP
`POST` request to `https://api.voiapp.io/v1/auth/verify/phone`

Body: raw/JSON
```json
{
    "country_code": "DE",
    "phone_number": "176xxxxxxxx"
}
```
Note: phone number is without any 0. 

In the body of the answer, you get a UUID in a param `token`, and of course an SMS message to the provided phone number. 
```json
{
"token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
## 2 - Verify OTP
This request gets nothing in the answer, but is necessary so that the token works. The `code` should be the value received by SMS. 

`POST` request to `https://api.voiapp.io/v2/auth/verify/code`

Body: raw/JSON
```json
{
    "code": "123456",
    "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
Answer is like the following:
```json
{
    "verificationStep": "emailValidationRequired",
    "authToken": "XXXXXXXXXXXX"
}
```
`verificationStep` can be `emailValidationRequired`, `authorized`, `deviceActivationRequired`.

 
## 3 - Get first authToken
**If `verificationStep` is `emailValidationRequired`:**  
This very likely means your phone number isn't linked to any account yet.

`POST` request to `https://api.voiapp.io/v1/auth/verify/presence`

Body: raw/JSON:
```json
{
    "email": "xxx@xxx.com",
    "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```
(the email should apparently be valid)
Answer will be: 
```json
{
    "authToken": "xxxxxxxxxxxxxxxx"
}
```
  
**If `verificationStep` is `deviceActivationRequired`:**  
This very likely means you logged into multiple devices. Per VOI tos this isn't allowed (they don't really care tho), you'll get logged out of other devices above when you have more than a few.

`POST` request to `https://api.voiapp.io/v3/auth/verify/device/activate`

Body: raw/JSON:
```json
{
    "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "provider": "sms"
}
```
(the email should apparently be valid)
Answer will be: 
```json
{
    "authToken": "xxxxxxxxxxxxxxxx"
}
```

**If `verificationStep` is `deviceActivationRequired`:**  
Nothing further to do. An `authToken` is already in the response.

## 4 - Open Session
`POST` request to `https://api.voiapp.io/v1/auth/session`

Body: raw/JSON
```json
{
    "authenticationToken": "xxxxxxxxxxxxxxxx"
}
```
Answer will be: 
```json
{
    "accessToken": "yyyyyyyyyyyyyyyyy",
    "authenticationToken": "zzzzzzzzzzzzzzzzzzz"
}
```
You will then use the `accessToken` to query the data, and the `authenticationToken` to open the next session, so that you don't have to re-do step 1-2-3

# Access scooter data
Once you have an Access Token, you can query the zones info, or if you already know which zone you want to query, get the scooters of the zone. 

## Get zones info
`GET` request to `https://api.voiapp.io/v1/zones`
In the headers you need the access token you got when opening a session: 
`x-access-token`: `yyyyyyyyyyyyyyyyy`

Answer: a long json with all the zones where VOI is currently operating, with details on the prices and forbidden zones, the max speed, etc. 
See here an example of the full zones json retrieved on Dec 20th, 2019: 
[https://gist.github.com/hawisizu/4d54000dc4d5d6d2e39f6994006b74d2](https://gist.github.com/hawisizu/4d54000dc4d5d6d2e39f6994006b74d2)

Notes: 
* you can also filter the results by passing `lng` and `lat` as params of the GET request.
* in the json there are some test cities

## Get Scooter info 
`GET` request to `https://api.voiapp.io/v2/rides/vehicles?zone_id=<ZONE_ID>`

`<ZONE_ID>` has to be the ID of one of the zones. 

In the headers you need the access token you got when opening a session: 
`x-access-token`: `yyyyyyyyyyyyyyyyy`

Answer: 
```json
{
  "data": {
    "vehicle_groups": [
      {
        "price_token": "...",
        "group_type": "scooter",
        "vehicles": [
          {
            "id": "274db72d-f108-417a-93e3-46acb61cfd26",
            "short": "kpne",
            "battery": 55,
            "location": {
              "lng": 18.11346435546875,
              "lat": 59.34138107299805
            },
            "zone_id": "1"
          },
          {
            "id": "3bd0b7bf-15c0-46f8-9d3b-ecb962f1f5d5",
            "short": "bnjs",
            "battery": 78,
            "location": {
              "lng": 18.088924407958984,
              "lat": 59.354530334472656
            },
            "zone_id": "1"
          }
        ]
      }
    ]
  }
}
```

The response is a nested object with information about each scooter, in a JSON format. Here is a list of the parameters in each scooter object and information about what they (most likely) do:

`id`: A scooter ID that most likely is used internally.

`short`: A four-character shortcode of the VOI scooter, which is used to unlock it in the app if you don´t scan the QR code on the scooter.

`battery`: An integer representing the battery percentage of the scooter.

`location`: An object of the scooter location.

`zone_id`: This is most likely an indication of what zone the scooter is located in. Each VOI zone is represented by an integer.

