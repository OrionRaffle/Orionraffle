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
async function getGlobalEData() {
  const response = await axios({
    headers: basicHeader,
    proxy: proxyConfig,
    method: 'GET',
    url: 'https://gem-fs.global-e.com/Localize/SetLocalize/NrJ8I4KmNTE%3d?&cacheBuster=1623270592956&jsoncallback=callback_SetLocalize',
  })
  return response.data;
}

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
  return resp.headers['set-cookie'];
}

const connect = async (cookies) => {
  const response = await request({
    method: "POST",
    uri: 'https://eu.kith.com/account/login',
    encoding: "UTF-8",
    resolveWithFullResponse: true,
    maxRedirects: 10,
    headers: {
      //'host': 'kith.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br",
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://kith.com',
      'Connection': 'keep-alive',
      'Referer': 'https://kith.com/account/login?return_url=%2Faccount',
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
      'customer[email]': 'djudjuldjul135@gmail.com',
      'customer[password]': 'DSR44l55',
      'return_url': '/account'
    }),
    followAllRedirects: true,
    proxy: proxyCharles
  });

  //console.log(response.body)
  return response.body.split('authenticity_token" value="')[1].split('"')[0]
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
  console.log(globalEData)
  globalEData = parseEData(globalEData)

  console.log(globalEData)
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

  var loginCookie = [
    'cart_currency=USD',
    'shopify_pay_redirect=pending',
    'dynamic_checkout_shown_on_cart=1',
    ' seedVisitedEU=true',
    'GlobalE_Data=' + globalEData,
    'GlobalE_SupportThirdPartCookies=true',
    '_shopify_sa_p=',
    `_shopify_sa_t=${new Date().toISOString().replace(':', '%3A')}`,
    'GlobalE_Full_Redirect=false',
    `displayedWelcomeMat=${encodeURIComponent(new Date())}`,
    'snize-recommendation=6wl90wc12hk',
    'geo_data={%22as%22:%22AS51207%20Free%20Mobile%20SAS%22%2C%22asname%22:%22FREEM%22%2C%22mobile%22:true%2C%22proxy%22:false%2C%22city%22:%22Paris%22%2C%22currency%22:{%22code%22:%22EUR%22}%2C%22country%22:{%22code%22:%22FR%22%2C%22country%22:%22France%22}%2C%22countryCode%22:%22FR%22%2C%22continent%22:%22Europe%22%2C%22continentCode%22:%22EU%22%2C%22isp%22:%22Free%20Mobile%22%2C%22lat%22:48.8714%2C%22lon%22:2.32141%2C%22org%22:%22Free%20Mobile%20SAS%22%2C%22query%22:%2237.164.206.4%22%2C%22region%22:%22IDF%22%2C%22regionName%22:%22%C3%8Ele-de-France%22%2C%22status%22:%22success%22%2C%22timezone%22:%22Europe/Paris%22%2C%22zip%22:%2275008%22%2C%22cloudflare%22:%22FR%22%2C%22ttl%22:1%2C%22env%22:%22PROD%22%2C%22currencyCode%22:%22EUR%22%2C%22countryName%22:%22France%22%2C%22service%22:%22ip.lovely-app.com%22}',
    //'__kla_id=eyIkcmVmZXJyZXIiOnsidHMiOjE2MjMyNzA1OTIsInZhbHVlIjoiIiwiZmlyc3RfcGFnZSI6Imh0dHBzOi8vZXUua2l0aC5jb20vYWNjb3VudC9sb2dpbj9yZXR1cm5fdXJsPSUyRmFjY291bnQifSwiJGxhc3RfcmVmZXJyZXIiOnsidHMiOjE2MjMyNzA1OTIsInZhbHVlIjoiIiwiZmlyc3RfcGFnZSI6Imh0dHBzOi8vZXUua2l0aC5jb20vYWNjb3VudC9sb2dpbj9yZXR1cm5fdXJsPSUyRmFjY291bnQifX0='
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

  await connect(loginCookie)
  process.exit(1)
}

login()


module.exports = {
  login
}

