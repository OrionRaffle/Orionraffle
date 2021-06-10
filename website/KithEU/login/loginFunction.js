const axios = require('axios-https-proxy-fix')
const qs = require('qs')
const Captcha = require("2captcha")
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const request = require('request-promise').defaults({
  jar: true
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const proxyConfig = {
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
  })
  return resp.headers['set-cookie'];//WHAT TO DO WITH TOKEN (it is cookie card value)? f10f9624332966c04bc9a6c7e2e2724c
}

const connect = async (cookies) => {
  const response = await request({
    method: "POST",
    uri: 'https://eu.kith.com/account/login',
    encoding: "UTF-8",
    resolveWithFullResponse: true,
    maxRedirects: 1,
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
      'customer[email]': 'soniastarlette@protonmail.com',
      'customer[password]': 'POKEMON1',
      'return_url': '/account'
    }),
    followAllRedirects: true,
    proxy: proxyCharles
  });
  return response.body.split('authenticity_token" value="')[1].split('"')[0]
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
  console.log(resp.data)
  return resp.data;
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


async function login() {
  let sessionCookie = await openSession();
  sessionCookie = parseCookie(sessionCookie);

  let globalEData = await getGlobalEData()
  globalEData = parseEData(globalEData)

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

  const geoDataJson = await getGeoData()

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
    if(cook[0]==='_landing_page'){loginCookie.push(`_landing_page=%2Faccount%2Flogin%3Freturn_url%3D%252Faccount`)}
    else loginCookie.push(cook.join('='))
  })
  cartCookieResult.forEach(cook => {
    loginCookie.push(cook.join('='))
  })
  const distinct = (value, index, self)=>{
    return self.indexOf(value) === index;
  }
  loginCookie = loginCookie.filter(distinct)
  console.log(loginCookie)
  console.log(loginCookie.length)

  await connect(loginCookie)
  process.exit(1)
}

login()


module.exports = {
  login
}

