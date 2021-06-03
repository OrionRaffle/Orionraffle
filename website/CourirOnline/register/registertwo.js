const axios = require('axios-https-proxy-fix');
var randomstring = require("randomstring");
const { SRPClient, calculateSignature, getNowString } = require('amazon-user-pool-srp-client');
const inputReader = require('wait-console-input');
const colors = require("colors");


// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;




const getIdRecaptcha = async (key, proxy) => {
  proxyconfig = {
    host: proxy.ip,
    port: proxy.port,
    auth: {
      username: proxy.user,
      password: proxy.password,
    },
  }

  try {
    const resp = await axios({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
        accept: '*/*',
        'content-type': 'application/json',
      },

      method: 'GET',
      url: `http://2captcha.com/in.php?key=${key}&method=userrecaptcha&json=1&googlekey=6LcEQb0UAAAAAFluVqTQqxfo1T9f7SM7jycCZBET&pageurl=https://www.sneakql.com/`,
      proxy: proxyconfig,
      timeout: 10000,
    })
    
    switch (resp.data.request) {
      case 'ERROR_ZERO_BALANCE':
        console.log('You have no more money on 2captcha')
        return -1
      case 'ERROR_WRONG_USER_KEY':
        console.log("The key you've provided does not exist.")
        return -1
      case 'ERROR_KEY_DOES_NOT_EXIST':
        console.log("The key you've provided does not exist.")
        return -1

      case 'ERROR_NO_SLOT_AVAILABLE':
        console.log('There is a queue to get a recaptcha solved.')
        return 1
    }

    return resp.data.request


  } catch (err) {

    return 0
  }
}

const getTokenRecaptcha = async (key, proxy, id) => {
  proxyconfig = {
    host: proxy.ip,
    port: proxy.port,
    auth: {
      username: proxy.user,
      password: proxy.password,
    },
  }

  try {
    const resp = await axios({
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
        accept: '*/*',
        'content-type': 'application/json',
      },

      method: 'GET',
      timeout:10000,
      url: `http://2captcha.com/res.php?key=${key}&method=userrecaptcha&json=1&action=get&id=${id}`,
      proxy: proxyconfig,

    })
 

    if (resp.data.request === 'CAPCHA_NOT_READY') {
      return 1
    }

    return resp.data.request
  } catch (err) {
    return 0
  }
}

const getUser = async (info, tokenRecaptcha, numero, proxyconfig) => {
  function between(min, max) {
    return Math.floor(
      Math.random() * (max - min) + min
    )
  }

  const day = between(1, 9)
  const month = between(1, 9)
  const year = between(1975, 1990)


  fingerprint = randomstring.generate({
    length: 32,
    charset: 'hex'
  });

  try {
    const resp = await axios({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.SignUp',
        'Connection': 'keep-alive'
      },
      method: 'POST',
      timeout: 10000,
      proxy: proxyconfig,
      url: 'https://cognito-idp.us-east-1.amazonaws.com/',
      data: {
        "ClientId": "165cbvf0gsromjvtdeor72t0pj", "Username": info.Email.toLowerCase(), "Password": info.Password, "UserAttributes": [{ "Name": "phone_number", "Value": info.num }], "ValidationData": null, "ClientMetadata": { "browserFingerprint": fingerprint, "drawId": info.IdRaffle, "locale": "fr-FR", "timezone": "Europe/Paris", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36", "birthdate": year + '-0' + month + '-0' + day, "email": info.Email.toLowerCase(), "firstName": info.FirstName, "lastName": info.LastName, "phone": info.num, "preferredName": info.FirstName, "title": "MR", "address1": info.Address, "address2": info.Address2, "addressAutoCompleteID": "", "city": info.City, "collectionMethod": "DELIVERY", "companyName": "", "country": info.Country.trim(), "postcode": info.PostalCode.trim(), "shippingName": info.FirstName + " " + info.LastName, "state": info.State, "billingName": info.FirstName + " " + info.LastName, "paymentConsent": "true", "paymentMethodID": info.payment_method, "privacyConsent": "false", "recaptchaToken": tokenRecaptcha, "retailerPrivacyConsent": "false", "shoeSize": String(info.Size), "termsConsent": "true", "sourceIP": info.ip, "setupIntentID": info.token }
      }
    });


    return resp.data
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error] Proxy error`))
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error] Proxy error`))
      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error] Proxy error`))
      return -1
    }
    if (err.code == 'ECONNABORTED') {
      console.log(colors.brightRed(`[Error] Proxy error`))
      return -1
    }


    if (err.errno == 'ENOENT') {
      console.log(colors.brightRed(`[Error] Proxy error`))
      return -1
    }

    if (err.code == 'ERR_SOCKET_CLOSED') {
      console.log(
        colors.brightRed(`[Error] Proxy does not exist`)
      )
      return -1
    }

    try{
    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error] Proxy error`))
      return -1
    }

    if (err.response.status == '502') {
      console.log(
        colors.brightRed(`[Error] Proxy too slow error`)
      )
      return -1
    }
    if (err.response.data.message.includes("email already exists")) {
      console.log(colors.brightRed("[Error][" + numero + "][" + info.Email + "] Email already exist"))
      return 0
    }
    if (err.response.data.message.includes("EQL_FAILURE_CODE=DUPLICATE_CARD")) {
      console.log(colors.brightRed("[Error][" + numero + "][" + info.Email + "] Card already exist"))
      return 0
    }

    if (err.response.data.message.includes("EQL_FAILURE_CODE=INTERNAL_ERROR")) {
      console.log(colors.brightRed("[Error][" + numero + "][" + info.Email + "] Error with this card"))
      return 0
    }
  }catch(err){}
    return -1
  }

}
const getSession = async (info, yolo, proxyconfig) => {


  try {
    const resp = await axios({

      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        'Connection': 'keep-alive'
      },
      method: 'POST',
      url: 'https://cognito-idp.us-east-1.amazonaws.com/',
      data: { "AuthFlow": "USER_SRP_AUTH", "ClientId": "165cbvf0gsromjvtdeor72t0pj", "AuthParameters": { "USERNAME": info.Email.toLowerCase(), "SRP_A": yolo }, "ClientMetadata": {} },
      proxy: proxyconfig,
      timeout:10000,

    });

    return resp.data;
  } catch (err) {
   
    return -1
  }
}

const getAccessToken = async (userid, secretblock, timestamp, signature, proxyconfig) => {


  try {
    const resp = await axios({

      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
        'Connection': 'keep-alive'
      },
      method: 'POST',
      url: 'https://cognito-idp.us-east-1.amazonaws.com/',
      data: { "ChallengeName": "PASSWORD_VERIFIER", "ClientId": "165cbvf0gsromjvtdeor72t0pj", "ChallengeResponses": { "USERNAME": userid, "PASSWORD_CLAIM_SECRET_BLOCK": secretblock, "TIMESTAMP": timestamp, "PASSWORD_CLAIM_SIGNATURE": signature }, "ClientMetadata": {} },
      proxy: proxyconfig,
      timeout:10000,
    });

    return resp.data;
  } catch (err) {
    return -1
  }
}


const sendCode = async (accessToken, proxyconfig) => {


  try {
    const resp = await axios({

      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.GetUserAttributeVerificationCode',
        'Connection': 'keep-alive'
      },
      method: 'POST',
      url: 'https://cognito-idp.us-east-1.amazonaws.com/',
      data: { "AttributeName": "email", "AccessToken": accessToken },
      proxy: proxyconfig,
      timeout:10000,
    });

    return resp.data;
  } catch (err) {
    return -1
  }
}

const verificationCode = async (accessToken, code, proxyconfig) => {


  try {
    const resp = await axios({

      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.VerifyUserAttribute',
        'Connection': 'keep-alive'
      },
      method: 'POST',
      url: 'https://cognito-idp.us-east-1.amazonaws.com/',
      data: { "AttributeName": "email", "Code": String(code), "AccessToken": accessToken },
      proxy: proxyconfig,
      timeout:10000,
    });
 
    return resp.data;
  } catch (err) {
   
    return true
  }
}

const getIdentityId = async (idToken, proxyconfig) => {


  try {
    const resp = await axios({

      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityService.GetId',
        'Connection': 'keep-alive'
      },
      method: 'POST',
      url: 'https://cognito-identity.us-east-1.amazonaws.com/',
      data: { "IdentityPoolId": "us-east-1:e97b1e70-cbae-4f6d-bc31-f0aa0a09d422", "Logins": { "cognito-idp.us-east-1.amazonaws.com/us-east-1_nyu5Glqkw": idToken } },
      proxy: proxyconfig,
      timeout:10000,
    });

    return resp.data;
  } catch (err) {
    return -1
  }
}
const getTokens = async (identityId, accessToken, proxyconfig) => {


  try {
    const resp = await axios({

      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityService.GetCredentialsForIdentity',
        'Connection': 'keep-alive'
      },
      method: 'POST',
      url: 'https://cognito-identity.us-east-1.amazonaws.com/',
      data: { "IdentityId": identityId, "Logins": { "cognito-idp.us-east-1.amazonaws.com/us-east-1_nyu5Glqkw": accessToken } },
      proxy: proxyconfig,
      timeout:10000,
    });

    return resp.data;
  } catch (err) {
    return -1
  }
}

const confirmOptions = async (userid, proxyconfig) => {




  try {
    const resp = await axios({
      host: 'lg3wc3fu5e.execute-api.us-east-1.amazonaws.com',
      method: 'OPTIONS',
      url: 'https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/entry/confirm?cid=' + userid,
      path: '/v1/entry/confirm?cid=' + userid,
      proxy: proxyconfig,
      timeout:10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/json',
        'Connection': 'keep-alive',
        'access-control-request-headers': 'authorization',
        'access-control-request-method': 'POST'

      }
    })


    return resp.data;
  } catch (err) {
   
    return -1
  }
}
const confirmation = async (userid, idToken, proxyconfig) => {


  try {
    const resp = await axios({
      host: 'lg3wc3fu5e.execute-api.us-east-1.amazonaws.com',
      method: 'POST',
      url: 'https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/entry/confirm?cid=' + userid,
      path: '/v1/entry/confirm?cid=' + userid,
      proxy: proxyconfig,
      timeout:10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/json',
        'Connection': 'keep-alive',
        'authorization': 'Bearer ' + idToken
      }
      
    })

    return resp.data

  } catch (err) {
    return -1
  }
}
const getInfo = async (userid, idToken, proxyconfig) => {




  try {
    const resp = await axios({
      host: 'lg3wc3fu5e.execute-api.us-east-1.amazonaws.com',
      method: 'GET',
      url: 'https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/user?cid=' + userid + '&drawid=CR0005',
      path: '/v1/user?cid=' + userid + '&drawid=CR0005',
      proxy: proxyconfig,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/json',
        'Connection': 'keep-alive',
        'authorization': 'Bearer ' + idToken
      }
    })


    return resp.data;
  } catch (err) {
    return -1
  }
}

const getOptionsInfo = async (userid, proxyconfig) => {



  try {
    const resp = await axios({
      host: 'lg3wc3fu5e.execute-api.us-east-1.amazonaws.com',
      method: 'OPTIONS',
      url: 'https://lg3wc3fu5e.execute-api.us-east-1.amazonaws.com/v1/user?cid=' + userid,
      path: '/v1/user?cid=' + userid,
      proxy: proxyconfig,

      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'content-type': 'application/json',
        'Connection': 'keep-alive',
        'access-control-request-headers': 'authorization',
        'access-control-request-method': 'GET'

      }
    })


    return resp.data;
  } catch (err) {
   return -1
  }
}
async function registertwo(info, numero, proxy, tokenRecaptcha ) {
  if(proxy != 0){
      proxyconfig = {
          host: proxy.ip,
          port: proxy.port,
          auth: {
            username: proxy.user,
            password: proxy.password
          }
        }
      }else{
         proxyconfig = null
      }

  // proxyconfig = {
  //   host: '127.0.0.1',
  //   port: '8888'
  // }
  const srp = new SRPClient("nyu5Glqkw")
  yolo = srp.calculateA()
  data = await getUser(info, tokenRecaptcha, numero, proxyconfig)
  if (data == 0 || data == -1) return data
  idUser = data.UserSub

  data2 = await getSession(info, yolo, proxyconfig)
  if (data2 == -1) return -1
  const dateNow = getNowString()

  const hkdf = srp.getPasswordAuthenticationKey(data2.ChallengeParameters.USER_ID_FOR_SRP, info.Password, data2.ChallengeParameters.SRP_B, data2.ChallengeParameters.SALT)
  const signatureString = calculateSignature(hkdf, "nyu5Glqkw", data2.ChallengeParameters.USER_ID_FOR_SRP, data2.ChallengeParameters.SECRET_BLOCK, dateNow)

  data3 = await getAccessToken(data2.ChallengeParameters.USER_ID_FOR_SRP, data2.ChallengeParameters.SECRET_BLOCK, dateNow, signatureString, proxyconfig)
  if(data3 == -1) return -1

  accessToken = data3.AuthenticationResult.AccessToken
  idToken = data3.AuthenticationResult.IdToken

  error = await sendCode(accessToken, proxyconfig)
  if(error == -1) return -1

  data4 = await getIdentityId(idToken, proxyconfig)
  if(data4 == -1) return data4
  identityId = data4.IdentityId

  data5 = await getTokens(identityId, idToken, proxyconfig)
  if(data5 == -1) return data5
  accessKeyId = data5.Credentials.AccessKeyId;
  sessionToken = data5.Credentials.SessionToken;
  secretKey = data5.Credentials.SecretKey;
  await getOptionsInfo(idUser, proxyconfig)
  await getInfo(idUser, idToken, proxyconfig)

  // if (sound) {
  //   try {
  //     soundTrigger.play(filePath);
  //   } catch (e) {

  //   }
  // }

  console.log(colors.green("[Info][" + numero + "][" + info.Email + "] Email code : (if you have not received the code, write 'no'. The email and the CC can never be used again."))
  input = inputReader.readLine()
  if (input.toLowerCase() == 'no') {
    console.log("[Info] Code never arrived")
    return 0
  }
  error = ''
  error = await verificationCode(accessToken, input, proxyconfig)
  while (error == true) {
    console.log(colors.brightRed("[Error][" + numero + "][" + info.Email + "] Incorrect verification code (or 'no' to skip this account)"))
    if (input.toLowerCase() == 'no') {
      console.log("[Info] Code never arrived")
      return 0
    }
    console.log(colors.green("[Info][" + numero + "][" + info.Email + "] Email code : "))
    input = inputReader.readLine()
    error = await verificationCode(accessToken, input, proxyconfig)

  }
  console.log(colors.green("[Info][" + numero + "][" + info.Email + "] Email Code successfully added"))


  await confirmOptions(idUser, proxyconfig)
  await confirmation(idUser, idToken, proxyconfig)
  console.log(colors.green("[Info][" + numero + "][" + info.Email + "] Your account is created and you have entered the draw"))


}


module.exports = {
  registertwo,
  getIdRecaptcha,
  getTokenRecaptcha
}
