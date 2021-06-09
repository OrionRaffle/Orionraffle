const axios = require('axios-https-proxy-fix')
const qs = require('qs')
const Captcha = require("2captcha")
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const request = require('request-promise').defaults({
  jar: true
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const proxyCharles = 'http://127.0.0.1:8888'


function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}


async function captcha() {


  // A new 'solver' instance with our API key
  const solver = new Captcha.Solver("18fd783e9ec10c948ecc7b259c5fc92e")

  /* Example ReCaptcha Website */
  solver.recaptcha("6LeoeSkTAAAAAA9rkZs5oS82l69OEYjKRZAiKdaF", "https://eu.kith.com/")

    .then((res) => {
   
      r = res.data
    }
    )
  await sleep(90000)
  return r
}

const getSessionId = async () => {

  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  try {
    const resp = await axios({

      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        'Content-Type': 'application/x-www-form-urlencoded',


      },
      proxy: proxyconfig,
      withCredentials: true,
      method: 'GET',
      url: 'https://eu.kith.com/account/login',
    })
    return resp.headers['set-cookie']
  } catch (err) {


    return 0

  }

}

const connect = async (sessionid) => {

  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }

  const response = await request({
    method: "POST",
    uri: 'https://eu.kith.com/account/login',
    encoding: "UTF-8",
    resolveWithFullResponse: true,
    maxRedirects:10,
    headers: {
      // 'host': 'https://eu.kith.com/',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
      // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      // "Accept-Language": "fr-FR,fr;q=0.8",
      // "Accept-Encoding": "gzip, deflate, br",
      // "Connection": "keep-alive",
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': sessionid,
    },
    simple: false,
    form: qs.stringify({
      'form_type': 'customer_login',
      'utf8': '✓',
      'customer[email]': 'bastien-bouge@hotmail.fr',
      'customer[password]': 'yoloyolo63!',
    
    }),
    followAllRedirects: true,
    proxy: proxyCharles
  });

  console.log(response.body)
  return response.body.split('authenticity_token" value="')[1].split('"')[0]

  // try {
  //   const resp = await axios({

      // headers: {
  //       'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
  //       "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        // "Accept-Language": "fr-FR,fr;q=0.8",
  //       "Accept-Encoding": "gzip, deflate, br",
  //       "Connection": "keep-alive",
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //       'Cookie':'_secure_session_id=' + sessionid,

  //     },
  //     method: 'POST',
  //     withCredentials: true,
  //     proxy:proxyconfig,
  //     url: 'https://eu.kith.com/account/login',
  //     data: qs.stringify({
  //       'form_type': 'customer_login',
  //       'utf8': '✓',
  //       'customer[email]': 'bastien-bouge@hotmail.fr',
  //       'customer[password]': 'yoloyolo63!',
  //       'return_url': '/account',
  //     })
  //   })
  //   console.log(resp)
  //   return resp
  // } catch (err) {
  //   console.log(err)
  //   return 0

  // }

}

const realConnect = async (sessionId, authenticityToken, captchasolv) => {

  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  // const response = await request({
  //   method: "POST",
  //   uri: 'https://eu.kith.com/account/login',
  //   encoding: "UTF-8",
  //   resolveWithFullResponse: true,
  //   headers: {
  //     // 'host': 'https://eu.kith.com/',
  //     'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
  //     // "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  //     // "Accept-Language": "fr-FR,fr;q=0.8",
  //     // "Accept-Encoding": "gzip, deflate, br",
  //     // "Connection": "keep-alive",
  //     // 'Content-Type': 'application/x-www-form-urlencoded',
  //     'Cookie': '_secure_session_id=' + sessionId,
  //   },
  //   simple: false,
  //   form: qs.stringify({
  //     'authenticity_token': authenticityToken,
  //     'g-recaptcha-response': captchasolv
  //   }),
  //   followAllRedirects: true,
  //   proxy: proxyCharles
  // });
  // console.log(response.headers['set-cookie'])
  try {
    const resp = await axios({

      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': '_secure_session_id=' + sessionId,
        'referer': 'https://eu.kith.com/challenge'


      },
      maxRedirects: 0,
      proxy: proxyconfig,
      method: 'POST',
      url: 'https://eu.kith.com/account/login',
      data: qs.stringify({
        'authenticity_token': authenticityToken,
        'g-recaptcha-response': captchasolv
      })
    })
    
    
    return resp.headers['set-cookie'][0].split(';')[0].split("=")[1]

  } catch (err) {
    console.log(err)

    return err.response.headers['set-cookie'][0].split(';')[0].split("=")[1]
  }

}

const getKithData = async (sessionId) => {


  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  try {
    const resp = await axios({

      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'cookie': "_secure_session_id=" + sessionId,
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'


      },
      proxy: proxyconfig,
      method: 'GET',
      url: 'https://eu.kith.com/account',
    })

    console.log(resp)
  } catch (err) {


  }

}


const getToken = async (sessionId) => {


  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  try {
    const resp = await axios({

      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'cookie': "_secure_session_id=" + sessionId,
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'


      },
      proxy: proxyconfig,
      method: 'POST',
      url: 'https://eu.kith.com/cart/update.js',
      data: qs.stringify({
        'attributes[lang]': 'en',
        'attributes[Invoice Language]': 'en'
      })
    })

    return resp.data.token
  } catch (err) {
    console.log(err)

  }

}

const getAuthenticityToken = async (sessionId) => {

  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  try {
    const resp = await axios({

      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'cookie': "_secure_session_id=" + sessionId + ";",
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'



      },
      proxy: proxyconfig,
      method: 'GET',
      withCredentials: true,
      url: 'https://eu.kith.com/challenge',
    })

    return resp.data.split('authenticity_token" value="')[1].split('"')[0]
  } catch (err) {


  }

}



async function login() {
  data = await getSessionId()
  sessionId = data[0].split(';')[0].split("=")[1]
  // cartsig = data[1].split(';')[0].split("=")[1]
  // y = data[5].split(';')[0].split("=")[1]
  // s = data[6].split(';')[0].split("=")[1]

  console.log(data)
  token = await connect(data[0])
  console.log(token)
  // token = await getToken(sessionId)

  // token = await getAuthenticityToken(sessionId)
  console.log("captcha solve")

  captchasolv = await captcha()

  console.log(captchasolv)
 newSessionId=  await realConnect(sessionId, token, captchasolv)
 console.log(newSessionId)


  return newSessionId
 
}

login()


module.exports = {
  login
}

