const axios = require('axios-https-proxy-fix');
const { magentaBright } = require('chalk');
const colors = require("colors")
const qs = require('qs');






const session = async () => {

  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  try {
    const resp = await axios({

      headers: {
        'user-agent': 'FLEU/CFNetwork/Darwin',
        "Accept": "application/json",
        "Accept-Language": "fr-FR,fr;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',


      },
      proxy:proxyconfig,
      method: 'GET',
      url: 'https://www.footlocker.fr/apigate/session',

    })
    return resp
  } catch (err) {
    if(err.response.status == '503'){
        return -1
        }
        console.log(err)

  }

}

const auth = async (token, cookie) => {

    try {
      const resp = await axios({
  
        headers: {
          'user-agent': 'FLEU/CFNetwork/Darwin',
          "Accept": "application/json",
          "Accept-Language": "fr-FR,fr;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'x-csrf-token': token,
          'Cookie': cookie,
          'x-flapi-session-id': cookie.split('=')[1],
          'x-flapi-api-identifier': '921B2b33cAfba5WWcb0bc32d5ix89c6b0f614'
  
  
        },
        proxy:proxyconfig,
        method: 'POST',
        url: 'https://www.footlocker.fr/apigate/auth',
        data: qs.stringify({
          "uid": "BastienBougeCop@gmail.com",
          "password": "!Yoloyolo63!"
        }),
      })
    
    
      
      return resp
    } catch (err) {
        if(err.response.status == '503'){
            return -1
            }
            console.log(err)
  
    }
  
  }
  const raffle = async (accessToken,cookie,city) => {

    try {
      const resp = await axios({
  
        headers: {
          'user-agent': 'FLEU/CFNetwork/Darwin',
          "Accept": "application/json",
          "Accept-Language": "fr-FR,fr;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'x-flapi-session-id':cookie.split('=')[1],
          'x-flapi-resource-identifier': accessToken,
          'x-flapi-api-identifier': '921B2b33cAfba5WWcb0bc32d5ix89c6b0f614'?
          'x-api-country'	:'FR',
          'x-api-lang':	'fr-FR',
          'cookie':cookie
  
  
        },
        proxy:proxyconfig,
        method: 'GET',
        url: 'https://www.footlocker.fr/apigate/launch-stores?address=' + city + ' &sku=60519bfa440aba22e46293e1&procedure=2',
  
      })
     
      return resp.data
     
    } catch (err) {
      if(err.response.status == '503'){
      return -1
      }
      console.log(err)
  
    }
  
  }

//   const account = async (accessToken,cookie) => {

//     try {
//       const resp = await axios({
  
//         headers: {
//           'user-agent': 'FLEU/CFNetwork/Darwin',
//           "Accept": "application/json",
//           "Accept-Language": "fr-FR,fr;q=0.8",
//           "Accept-Encoding": "gzip, deflate, br",
//           "Connection": "keep-alive",
//           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
//           'x-flapi-session-id':cookie.split('=')[1],
//           'x-flapi-resource-identifier': accessToken,
//           'x-flapi-api-identifier': '921B2b33cAfba5WWcb0bc32d5ix89c6b0f614'?
//           'x-api-country'	:'FR',
//           'x-api-lang':	'fr-FR',
//           'cookie':cookie
  
  
//         },
//         proxy:proxyconfig,
//         method: 'GET',
//         url: 'https://www.footlocker.fr/apigate/users/account-info',
  
//       })
     
//     } catch (err) {
//       console.log(err)
  
//     }
  
//   }


async function raffleData(city){
  
    resp = await session()
    while(resp == -1){
        resp = await session()
    }
    cookie = resp.headers['set-cookie'][0]
    cookie = cookie.split(';')[0]
   
    token = resp.data.data.csrfToken
   
    authData = await auth(token,cookie)
    while(resp == -1){
        authData = await auth(token,cookie)
    }
    accessToken = authData.data.oauthToken.access_token
    cookie = authData.headers['set-cookie'][0]
    cookie = cookie.split(';')[0]
    data = await raffle(accessToken,cookie,city)
    while(resp == -1){
        data = await raffle(accessToken,cookie,city)

    }
    return data
  
  }

// async function raffleEntry(csvRaffle){

// }
  
  
  module.exports = {
      raffleData
  }