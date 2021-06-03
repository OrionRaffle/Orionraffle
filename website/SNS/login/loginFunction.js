
const axios = require('axios-https-proxy-fix')
const aws4 = require('aws4')
const colors = require('colors')
const mysql = require('mysql')

const device = [
  'Iphone 9,3',
  'Iphone 9,4',
  'Iphone 10,4',
  'Iphone 10,5',
  'Iphone 11,2',
  'Iphone 11,4',
  'Iphone 11,8',
  'Iphone 12,1',
  'Iphone 12,3',
  'Iphone 12,5',
  'Iphone 13,1',
  'Iphone 13,2',
  'Iphone 13,3',
  'Iphone 13,4',
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}
const getSession = async (username, proxy) => {
  if (proxy != 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }
  try {
    const resp = await axios({
      headers: {
        'User-Agent': 'rafflemobile/386 CFNetwork/1206 Darwin/20.1.0',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        Connection: 'keep-alive',
      },
      method: 'POST',
      timeout: 10000,
      url: 'https://cognito-idp.eu-west-1.amazonaws.com/',
      data: {
        AuthFlow: 'CUSTOM_AUTH',
        ClientId: '60skugd7dfshb9qerf70h38e2q',
        AuthParameters: { USERNAME: username.toLowerCase() },
        ClientMetadata: {},
      },
      proxy: proxyconfig,
    })

    return resp.data.Session
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))
      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))
      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))
      return -1
    }

    if (err.errno == 'ENOENT') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))
      return -1
    }

    if (err.code == 'ERR_SOCKET_CLOSED') {
      console.log(
        colors.brightRed(`[Error][${username}] Proxy does not exist`)
      )
      return -1
    }
    try{
    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))
      return -1
    }

    if (err.response.status == '502') {
      console.log(
        colors.brightRed(`[Error][${username}] Proxy too slow error`)
      )
      return -1
    }
    if (err.response.status == '400') {
      return -2
    }
  }catch(e){}

    return -1
  }
}
const getFirstAccessToken = async (username, password, proxy) => {
  if (proxy != 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }
  try {
    const resp = await axios({
      headers: {
        'User-Agent': 'rafflemobile/386 CFNetwork/1206 Darwin/20.1.0',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        Connection: 'keep-alive',
      },
      method: 'POST',
      url: 'https://cognito-idp.eu-west-1.amazonaws.com/',
      data: {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: '60skugd7dfshb9qerf70h38e2q',
        AuthParameters: {
          USERNAME: username.toLowerCase(),
          PASSWORD: password,
        },
        ClientMetadata: {},
      },
      proxy: proxyconfig,
    })

    return resp.data.AuthenticationResult
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    try{
    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }

    if (err.response.status == '502') {
      console.log(
        colors.brightRed(`[Error][${username}] Proxy too slow error`)
      )

      return -1
    }
    if (err.response.status == '400') {
      console.log(colors.brightRed(`[Error][${username}] Email or password does not exist`))
      console.log('[Info] Waiting for the next task')
      return 0
    }

    }catch(e){}
    return -1
  }
}

const getAccessToken = async (username, password, session, proxy) => {
  if (proxy != 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }
  try {
    const resp = await axios({
      headers: {
        'User-Agent': 'rafflemobile/386 CFNetwork/1206 Darwin/20.1.0',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target':
          'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
        Connection: 'keep-alive',
      },
      method: 'POST',
      proxy: proxyconfig,
      timeout: 10000,
      url: 'https://cognito-idp.eu-west-1.amazonaws.com/',
      data: {
        ChallengeName: 'CUSTOM_CHALLENGE',
        ChallengeResponses: {
          USERNAME: username.toLowerCase(),
          ANSWER: password,
        },
        ClientId: '60skugd7dfshb9qerf70h38e2q',
        Session: session,
      },
    })

    return resp.data.AuthenticationResult
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }

    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    try {
      if (err.response.status == '407') {
        console.log(colors.brightRed(`[Error][${username}] Proxy error`))

        return -1
      }

      if (err.response.status == '502') {
        console.log(
          colors.brightRed(`[Error][${username}] Proxy too slow error`)
        )

        return -1
      }
      if (err.response.status == '400') {
        console.log(
          colors.brightRed(`[Error][${username}] Password does not match`)
        )
        console.log('[Info] Waiting for the next task')
        return 0
      }


    } catch (e) { }
    return -1
  }
}


const getIdentityId = async (idToken, proxy, username) => {
  if (proxy != 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }
  try {
    const resp = await axios({
      headers: {
        'User-Agent': 'rafflemobile/386 CFNetwork/1206 Darwin/20.1.0',
        'x-amz-content-sha256':
          '0216836a277c6ccf5e4153dbf6c24bab26c231efbbc52271b329cb9f6ebb1b42',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityService.GetId',
        Connection: 'keep-alive',
      },
      method: 'POST',
      proxy: proxyconfig,
      timeout: 10000,
      url: 'https://cognito-identity.eu-west-1.amazonaws.com/',
      data: {
        IdentityPoolId: 'eu-west-1:e189bafd-8e13-4657-8800-68190ed2fac1',
        Logins: {
          'cognito-idp.eu-west-1.amazonaws.com/eu-west-1_8ywWI3Ia9': idToken,
        },
      },
    })

    return resp.data
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }

    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    try {
      if (err.response.status == '407') {
        console.log(colors.brightRed(`[Error][${username}] Proxy error`))

        return -1
      }

      if (err.response.status == '502') {
        console.log(
          colors.brightRed(`[Error][${username}] Proxy too slow error`)
        )

        return -1
      }
    } catch (e) { }
    return -1
  }
}

const getCredential = async (idToken, identityId, proxy, username) => {
  if (proxy != 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }
  try {
    const resp = await axios({
      headers: {
        'User-Agent': 'rafflemobile/386 CFNetwork/1206 Darwin/20.1.0',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityService.GetCredentialsForIdentity',
        Connection: 'keep-alive',
      },
      method: 'POST',
      proxy: proxyconfig,
      timeout: 10000,
      url: 'https://cognito-identity.eu-west-1.amazonaws.com/',
      data: {
        Logins: {
          'cognito-idp.eu-west-1.amazonaws.com/eu-west-1_8ywWI3Ia9': idToken,
        },
        IdentityId: identityId,
      },
    })

    return resp.data.Credentials
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    try{
    if (err.response.status == '407') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }

    if (err.response.status == '502') {
      console.log(
        colors.brightRed(`[Error][${username}] Proxy too slow error`)
      )

    }
  }catch(e){}

    return -1
  }
}

const getUserId = async (accessToken, proxy, username) => {
  if (proxy != 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }
  try {
    const resp = await axios({
      headers: {
        'User-Agent': 'rafflemobile/386 CFNetwork/1206 Darwin/20.1.0',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.GetUser',
        Connection: 'keep-alive',
      },
      method: 'POST',
      proxy: proxyconfig,
      timeout: 10000,
      url: 'https://cognito-idp.eu-west-1.amazonaws.com/',
      data: { AccessToken: accessToken },
    })

    return resp.data
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }

    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }

    try {
      if (err.response.status == '407') {
        console.log(colors.brightRed(`[Error][${username}] Proxy error`))

        return -1
      }

      if (err.response.status == '502') {
        console.log(
          colors.brightRed(`[Error][${username}] Proxy too slow error`)
        )

        return -1
      }

    } catch (e) { }
    return -1
  }
}

const getNewAccessToken = async (refreshToken, proxy, username) => {
  if (proxy != 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }
  try {
    const resp = await axios({
      headers: {
        'User-Agent': 'rafflemobile/386 CFNetwork/1206 Darwin/20.1.0',
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        Connection: 'keep-alive',
      },
      method: 'POST',
      proxy: proxyconfig,
      timeout: 10000,
      url: 'https://cognito-idp.eu-west-1.amazonaws.com/',
      data: {
        ClientId: '60skugd7dfshb9qerf70h38e2q',
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: { REFRESH_TOKEN: refreshToken },
      },
    })

    return resp.data.AuthenticationResult
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }

    try {
      if (err.code == 'ECONNRESET') {
        console.log(colors.brightRed(`[Error][${username}] Proxy error`))

        return -1
      }
      if (err.response.status == '407') {
        console.log(colors.brightRed(`[Error][${username}] Proxy error`))

        return -1
      }

      if (err.response.status == '502') {
        console.log(
          colors.brightRed(`[Error][${username}] Proxy too slow error`)
        )

        return -1
      }
    } catch (e) { }
    return -1
  }
}

const getAccountData = async (
  accessKeyId,
  secretAccessKey,
  sessionToken,
  proxy,
  username
) => {
  if (proxy != 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }

  const request = {
    host: 'g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com',
    method: 'GET',
    url: `https://g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com/Prod/api/account`,
    path: `/Prod/api/account`,
    proxy: proxyconfig,
    timeout: 10000,
    headers: {
      'User-Agent': 'aws-amplify/1.2.3 react-native',
      'content-type': 'application/json',
      Connection: 'keep-alive',
    },
  }

  const signedRequest = aws4.sign(request, {
    secretAccessKey,
    accessKeyId,
    sessionToken,
  })

  delete signedRequest.headers.host
  delete signedRequest.headers['Content-Length']
  try {
    const resp = await axios(signedRequest)
    return resp.data
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }

    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }

    try {
      if (err.response.status == '407') {
        console.log(colors.brightRed(`[Error][${username}] Proxy error`))

        return -1
      }

      if (err.response.status == '502') {
        console.log(
          colors.brightRed(`[Error][${username}] Proxy too slow error`)
        )

        return -1
      }
    } catch (e) { }

    return -1
  }
}
async function getRaffleId() {
  const connection = mysql.createConnection({
    host: '185.31.40.53',
    user: 'orion',
    password: '785421BG',
    database: 'orion_user',
  })

  connection.connect()
  q = `SELECT idRaffle from website where website="SNS"`

  connection.query(q, (error, results) => {
    if (error) throw error

    idSNS = results
  })
  await sleep(500)
  connection.end()
  return idSNS
}

async function removeRaffleId(id) {
  const connection = mysql.createConnection({
    host: '185.31.40.53',
    user: 'orion',
    password: '785421BG',
    database: 'orion_user',
  })

  connection.connect()
  q = `DELETE from website where idRaffle="${id}"`

  connection.query(q, (error, results) => {

    if (error) throw error
  })
  await sleep(500)
  connection.end()
}

const getRaffleData = async (
  accessKeyId,
  secretAccessKey,
  sessionToken,
  proxy,
  username
) => {
  if (proxy != 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }
  const r = getRandomInt(1001, 9999)
  const request = {
    host: 'g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com',
    method: 'GET',
    timeout: 10000,
    url:
      `https://g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com/Prod/api/configurations?onlyInfo=true&cacheBust=${r}`,
    path: `//Prod/api/configurations?onlyInfo=true&cacheBust=${r}`,
    proxy: proxyconfig,
    headers: {
      'User-Agent': 'aws-amplify/1.2.3 react-native',
      'content-type': 'application/json',
      Connection: 'keep-alive',
    },
  }

  const signedRequest = aws4.sign(request, {
    secretAccessKey,
    accessKeyId,
    sessionToken,
  })

  try {
    const resp = await axios(signedRequest)
    return resp.data
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }

    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    try {
      if (err.response.status == '407') {
        console.log(colors.brightRed(`[Error][${username}] Proxy error`))

        return -1
      }

      if (err.response.status == '502') {
        console.log(
          colors.brightRed(`[Error][${username}] Proxy too slow error`)
        )


      }
    } catch (e) {
      return -1
    }
  }
}

const getRaffleJSON = async (
  accessKeyId,
  secretAccessKey,
  sessionToken,
  proxy,
  username
) => {
  if (proxy != 0) {
    proxyconfig = {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password,
      },
    }
  } else {
    proxyconfig = null
  }
  const r = getRandomInt(1001, 9999)
  const request = {
    host: 'g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com',
    method: 'GET',
    url:
      `https://g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com/Prod/api/configurations?cacheBust=${r}`,
    path: `//Prod/api/configurations?onlyInfo=true&cacheBust=${r}`,
    proxy: proxyconfig,
    headers: {
      'User-Agent': 'aws-amplify/1.2.3 react-native',
      'content-type': 'application/json',
      Connection: 'keep-alive',
    },
  }

  const signedRequest = aws4.sign(request, {
    secretAccessKey,
    accessKeyId,
    sessionToken,
  })

  try {
    const resp = await axios(signedRequest)
    return resp.data
  } catch (err) {
    if (err.errno == 'ENOTFOUND') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    if (err.errno == 'ECONNREFUSED') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }

    if (err.code == 'ECONNRESET') {
      console.log(colors.brightRed(`[Error][${username}] Proxy error`))

      return -1
    }
    try {
      if (err.response.status == '407') {
        console.log(colors.brightRed(`[Error][${username}] Proxy error`))

        return -1
      }

      if (err.response.status == '502') {
        console.log(
          colors.brightRed(`[Error][${username}] Proxy too slow error`)
        )
      }
    } catch (e) { }
    return -1
  }

}

const iterableUpdate = async (email) => {
  try {
    const resp = await axios({
      headers: {
        'api-key': 'e698df3beb42400caf7c3e0a323019b9',
        'User-Agent': 'aws-amplify/1.2.3 react-native',
        'content-type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      url: 'https://api.iterable.com:443/api/users/update',
      data: {
        email,
        mergeNestedObjects: true,
      },
    })
    console.log(resp)
  } catch (err) {
    // Handle Error Here
    console.error(err)
  }
}

const IterableventTrack = async (email, userid, edgeuserid) => {
  const n = getRandomInt(0, device.length)
  const d = device[n]
  try {
    const resp = await axios({
      headers: {
        'api-key': 'e698df3beb42400caf7c3e0a323019b9',
        'User-Agent': 'aws-amplify/1.2.3 react-native',
        'content-type': 'application/json;charset=utf-8',
      },
      method: 'POST',
      url: 'https://api.iterable.com:443/api/events/track',
      data: {
        email,
        eventName: 'AppLoggedInEvent',
        dataFields: {
          Email: email,
          PaymentMethodValidated: false,
          PhoneValidated: false,
          ShippingAddressValidated: false,
          UserId: userid,
          EdgeUserId: edgeuserid,
          Country: 'FR',
          Locale: 'fr-FR',
          Version: '1.2.9.386',
          Timezone: 'Europe/Paris',
          Language: 'fr',
          Device: `Apple ${d}`,
        },
      },
    })
    return resp.data
  } catch (err) {
    // Handle Error Here
    console.error(err)
  }
}

// const deleteAdresse = async (
//   idAdresse,
//   secretAccessKey,
//   accessKeyId,
//   sessionToken
// ) => {
//   const request = {
//     host: 'g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com',
//     method: 'DELETE',
//     url:
//       `https://g1ik5r2vf5.execute-api.eu-west-1.amazonaws.com/Prod/api/address/${ 
//       id}`,
//     path: `/Prod/api/account/${  id}`,
//     headers: {
//       'User-Agent': 'aws-amplify/1.2.3 react-native',
//       'content-type': 'application/json',
//     },
//   }

//   const signedRequest = aws4.sign(request, {
//     secretAccessKey,
//     accessKeyId,
//     sessionToken,
//   })

//   delete signedRequest.headers.host
//   delete signedRequest.headers['Content-Length']
//   try {
//     const resp = await axios(signedRequest)
//     return resp.data
//   } catch (err) {}
// }

module.exports = {
  getSession,
  getAccessToken,
  getIdentityId,
  getCredential,
  getUserId,
  getNewAccessToken,
  getAccountData,
  getRaffleData,
  iterableUpdate,
  IterableventTrack,
  getFirstAccessToken,
  getRaffleJSON,
  getRaffleId,
  removeRaffleId,
}
