const axios = require('axios-https-proxy-fix')
const qs = require('qs')
const Captcha = require("2captcha")
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const request = require('request-promise').defaults({
  jar: true
});

const { getRandomProxy } = require('../../../utils/dev')
const { logUnitTest, logError, logInfo } = require('../../../utils/console')

//process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

//DEBUG
Object.defineProperty(global, '__stack', {
  get: function () {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: function () {
    return __stack[1].getLineNumber();
  }
});

Object.defineProperty(global, '__function', {
  get: function () {
    return __stack[1].getFunctionName();
  }
});

//



var proxyConfig = {
  host: '127.0.0.1',
  port: '8888',
}
const proxyCharles = `http://${proxyConfig.host}:${proxyConfig.port}`

const basicHeader = {
  'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "fr-FR,fr;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  'Content-Type': 'application/x-www-form-urlencoded',
}

//Get basic cookies here
/*
[
  '_secure_session_id=0bd396e8cf15e2b6dae121b9edfeb13b; path=/; expires=Fri, 11 Jun 2021 12:09:10 GMT; secure; HttpOnly; SameSite=Lax',
  'cart_sig=93fb79fcccca0348d2fa31037ee15481; path=/; expires=Thu, 24 Jun 2021 12:09:10 GMT; HttpOnly; SameSite=Lax',
  'secure_customer_sig=; path=/; expires=Fri, 10 Jun 2022 12:09:10 GMT; secure; HttpOnly; SameSite=Lax',
  '_orig_referrer=; Expires=Thu, 24-Jun-21 12:09:10 GMT; Domain=kith.com; Path=/; HttpOnly; SameSite=Lax',
  '_landing_page=%2Faccount%2Flogin; Expires=Thu, 24-Jun-21 12:09:10 GMT; Domain=kith.com; Path=/; HttpOnly; SameSite=Lax',
  '_y=8493c79b-3b78-4b09-a305-6e5eea11d7e9; Expires=Fri, 10-Jun-22 12:09:10 GMT; Domain=kith.com; Path=/; SameSite=Lax',
  '_s=57c29ba1-83cd-4d71-b9a3-18ad2fb0bdab; Expires=Thu, 10-Jun-21 12:39:10 GMT; Domain=kith.com; Path=/; SameSite=Lax',
  '_shopify_y=8493c79b-3b78-4b09-a305-6e5eea11d7e9; Expires=Fri, 10-Jun-22 12:09:10 GMT; Domain=kith.com; Path=/; SameSite=Lax',       
  '_shopify_s=57c29ba1-83cd-4d71-b9a3-18ad2fb0bdab; Expires=Thu, 10-Jun-21 12:39:10 GMT; Domain=kith.com; Path=/; SameSite=Lax'        
]
*/
async function openSession() {
  const response = await axios({
    headers: basicHeader,
    proxy: proxyConfig,
    withCredentials: true,
    method: 'GET',
    url: 'https://eu.kith.com/account/login',
  })
  logUnitTest(__filename, __function, __line, 'Open session request status', 200, response.status, true);
  logUnitTest(__filename, __function, __line, 'Session cookie', '', response.headers['set-cookie']);
  return response.headers['set-cookie'];
}
//Get Global E Data here
//callback_SetLocalize({"CountryCode":"FR","CurrencyCode":"EUR","CultureCode":"fr","IsOperatedByGlobalE":true,"IsSupportsFixedPrice":false})
async function getGlobalEData() {
  const response = await axios({
    headers: basicHeader,
    proxy: proxyConfig,
    method: 'GET',
    url: 'https://gem-fs.global-e.com/Localize/SetLocalize/NrJ8I4KmNTE%3d?&cacheBuster=1623270592956&jsoncallback=callback_SetLocalize',
  })
  logUnitTest(__filename, __function, __line, 'Global E Data', 'callback_SetLocalize({"CountryCode":"FR","CurrencyCode":"EUR","CultureCode":"fr","IsOperatedByGlobalE":true,"IsSupportsFixedPrice":false})', response.data);
  return response.data;
}
//Get card/update cookie from shopify
/*
[
  'cart=57d8a993b5a0260f5ab5541ba6aaf3ff; path=/; expires=Thu, 24 Jun 2021 12:09:11 GMT; SameSite=Lax',
  'cart_ts=1623326951; path=/; expires=Thu, 24 Jun 2021 12:09:11 GMT; HttpOnly; SameSite=Lax',
  'cart_currency=EUR; path=/; expires=Thu, 24 Jun 2021 12:09:11 GMT; SameSite=Lax',
  'cart_sig=93fb79fcccca0348d2fa31037ee15481; path=/; expires=Thu, 24 Jun 2021 12:09:11 GMT; HttpOnly; SameSite=Lax',
  'secure_customer_sig=; path=/; expires=Fri, 10 Jun 2022 12:09:11 GMT; secure; HttpOnly; SameSite=Lax',
  'cart_ver=gcp-us-east1%3A1; path=/; expires=Thu, 24 Jun 2021 12:09:11 GMT; HttpOnly; SameSite=Lax',
  '_y=8493c79b-3b78-4b09-a305-6e5eea11d7e9; Expires=Fri, 10-Jun-22 12:09:11 GMT; Domain=kith.com; Path=/; SameSite=Lax',
  '_s=57c29ba1-83cd-4d71-b9a3-18ad2fb0bdab; Expires=Thu, 10-Jun-21 12:39:11 GMT; Domain=kith.com; Path=/; SameSite=Lax',
  '_shopify_y=8493c79b-3b78-4b09-a305-6e5eea11d7e9; Expires=Fri, 10-Jun-22 12:09:11 GMT; Domain=kith.com; Path=/; SameSite=Lax',
  '_shopify_s=57c29ba1-83cd-4d71-b9a3-18ad2fb0bdab; Expires=Thu, 10-Jun-21 12:39:11 GMT; Domain=kith.com; Path=/; SameSite=Lax'
]
*/
async function update(cookies) {
  const resp = await axios({
    headers: {
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Cookie': cookies.join(';'),
    },
    proxy: proxyConfig,
    method: 'POST',
    url: 'https://eu.kith.com/cart/update.js',
  }).catch(err=>logError(err))
  logUnitTest(__filename, __function, __line, 'Update cookies', '', resp.headers['set-cookie']);
  return resp.headers['set-cookie'];
}

const connect = async (cookies, callback) => {
  const response = await request({
    method: "POST",
    uri: 'https://eu.kith.com/account/login',
    encoding: "UTF-8",
    resolveWithFullResponse: true,
    maxRedirects: 2,
    headers: {
      'host': 'eu.kith.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br",
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://eu.kith.com',
      'Connection': 'keep-alive',
      'Referer': 'https://eu.kith.com/account/login?return_url=%2Faccount',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'DNT': '1',
      'Sec-GPC': '1',
      'Cookie': cookies.join(';'),
    },
    simple: false,
    form: qs.stringify({
      'form_type': 'customer_login',
      'utf8': '✓',
      'customer[email]': 'clementTest@gmail.com',
      'customer[password]': 'POKEMON1',
      'return_url': '/account'
    }),
    followAllRedirects: true,
    proxy: `http://${proxyConfig.auth.username}:${proxyConfig.auth.password}@${proxyConfig.host}:${proxyConfig.port}`
  }, async function (err, response, body) {
    if(err) logError(err);
    const secureToken = response.headers['set-cookie'][0].split(';')[0].split('=')[1]
    await callback(secureToken)
  }).catch(err => {
    //console.log('here')
    //console.log(err.options.Cookie)
  });
}
async function getGeoData() {
  const resp = await axios({
    headers: {
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    proxy: proxyConfig,
    method: 'GET',
    url: 'https://ip.lovely-app.com/',
  })
  logUnitTest(__filename, __function, __line, 'Geo data', '', resp.data._secure_session_id);
  return resp.data._secure_session_id;
}

function parseCookie(cookies) {
  var cookiesToArray = []
  cookies.forEach(cookie => {
    let tab = cookie.split(';')
    let keyValue = tab[0].split('=');
    cookiesToArray.push([keyValue[0], keyValue[1]]);
  });
  return cookiesToArray;
}
function parseEData(data) {
  const json = JSON.parse(data.substring(data.indexOf('{'), data.indexOf('}') + 1));
  return `%7B%22countryISO%22%3A%22$${json.CountryCode}%22%2C%22currencyCode%22%3A%22${json.CurrencyCode}%22%2C%22cultureCode%22%3A%22${json.CultureCode}%22%7D`;
}

async function updateAdresses(cookies, account) {
  try {
    const resp = await axios({
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cookie': cookies.join(';'),
      },
      proxy: proxyConfig,
      method: 'POST',
      url: 'https://eu.kith.com/account/addresses',
      data: qs.stringify({
        'form_type': 'customer_address',
        'utf8': '✓',
        'address[first_name]': account.first_name,
        'address[last_name]': account.last_name,
        'address[company]': account.company,
        'address[address1]': account.address1,
        'address[address2]': account.address2,
        'address[country]': account.country,
        'address[city]': account.city,
        'address[zip]': account.zip,
        'address[phone]': account.phone,
        'address[default]': '1',
      })
    });
  } catch (err) {
    console.log(err.data)
  }
}

async function login() {
  logUnitTest(__filename, __function, __line, 'Login start');
  const proxy1 = await getRandomProxy()
  proxyConfig = {
    host: proxy1.ip,
    port: proxy1.port,
    auth: {
      username: proxy1.user,
      password: proxy1.password
    }
  };

  let sessionCookie = await openSession();
  sessionCookie = parseCookie(sessionCookie);

  let globalEData = await getGlobalEData();
  globalEData = parseEData(globalEData);

  var cardCookie = [
    ' seedVisitedEU=true',
    'GlobalE_Data=' + globalEData,
    'GlobalE_SupportThirdPartCookies=true',
    '_shopify_sa_p=',
    `_shopify_sa_t=${new Date().toISOString().replace(':', '%3A')}`,
    'GlobalE_Full_Redirect=false',
    `displayedWelcomeMat=${encodeURIComponent(new Date())}`
  ]
  sessionCookie.forEach(cook => {
    cardCookie.push(cook.join('='))
  })

  var cartCookieResult = await update(cardCookie);
  cartCookieResult = parseCookie(cartCookieResult);

  const geoDataJson = await getGeoData();

  var loginCookie = [
    ' seedVisitedEU=true',
    'GlobalE_Data=' + globalEData,
    'GlobalE_SupportThirdPartCookies=true',
    '_shopify_sa_p=',
    `_shopify_sa_t=${encodeURIComponent(new Date().toISOString())}`,
    'GlobalE_Full_Redirect=false',
    `displayedWelcomeMat=${encodeURIComponent(new Date())}`,
    'snize-recommendation=6wl90wc12hk',
    `geo_data=${encodeURIComponent(JSON.stringify(geoDataJson))}`,
    '__kla_id=eyIkcmVmZXJyZXIiOnsidHMiOjE2MjMyNzA1OTIsInZhbHVlIjoiIiwiZmlyc3RfcGFnZSI6Imh0dHBzOi8vZXUua2l0aC5jb20vYWNjb3VudC9sb2dpbj9yZXR1cm5fdXJsPSUyRmFjY291bnQifSwiJGxhc3RfcmVmZXJyZXIiOnsidHMiOjE2MjMyNzA1OTIsInZhbHVlIjoiIiwiZmlyc3RfcGFnZSI6Imh0dHBzOi8vZXUua2l0aC5jb20vYWNjb3VudC9sb2dpbj9yZXR1cm5fdXJsPSUyRmFjY291bnQifX0='
  ]
  sessionCookie.forEach(cook => {
    if (cook[0] === '_landing_page') { loginCookie.push(`_landing_page=%2Faccount%2Flogin%3Freturn_url%3D%252Faccount`) }
    else loginCookie.push(cook.join('='))
  })
  cartCookieResult.forEach(cook => {
    loginCookie.push(cook.join('='))
  })
  const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
  }
  loginCookie = loginCookie.filter(distinct)
  //console.log(loginCookie)
  //console.log(loginCookie.length)

  await connect(loginCookie, async function temp(token) {
    logUnitTest(__filename, __function, __line, 'Trying to connect user');
    const accountH = {
      'address[first_name]': 'SoniaSuccess',
      'address[last_name]': 'Starl',
      'address[company]': '',
      'address[address1]': 'Adresse1',
      'address[address2]': 'Adresse2',
      'address[country]': 'France',
      'address[city]': 'CLF',
      'address[zip]': '63000',
      'address[phone]': '0754555555',
    }
    var cookiesH = []
    loginCookie.forEach(element => {
      if (element.split(':')[0] === '') cookiesH.push('_secure_session_id:' + token)
      else if (element.split(':')[0] === 'GlobalE_Data') { }
      else if (element.split(':')[0] === 'GlobalE_SupportThirdPartCookies') { }
      else cookiesH.push(element)
    })
    cookiesH.push('KL_FORMS_MODAL={%22disabledForms%22:{}%2C%22viewedForms%22:{%22TS5hEr%22:2820827}}')
    logUnitTest(__filename, __function, __line, 'Login cookies', '', cookiesH);
    //await updateAdresses(cookiesH, accountH)
    //process.exit(1)
  })
  //console.log(connectedToken)
}

login()


module.exports = {
  login
}

