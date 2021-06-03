const axios = require('axios-https-proxy-fix')
const qs = require('qs')
const mysql = require('mysql')
const extract = require('extract-json-from-string');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const register = async (csv, proxy) => {
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

  proxyconfig = {
    host: '127.0.0.1',
    port: '8888'
  }
  try {
    const resp = await axios({
      headers: {
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        Referer: 'https://www.shuzulab.com/en/login?back=my-account',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Site': 'same-origin',
        'cache-control': 'no-cache',
      },
      proxy: proxyconfig,
      method: 'POST',
      timeout:10000,
      url: `https://www.shuzulab.com/?rand=${new Date().getTime()}`,
      data: qs.stringify({
        controller: 'authentication',
        SubmitCreate: '1',
        ajax: 'true',
        email_create: csv.Email,
        back: 'my-account',
        token: '10ca261cec5528e60dec5db725f5d9af',
      }),
    })
    
    return resp.data.hasError
  } catch (err) {
    console.log(err)
    return -1
  }
}

const genAccountFunction = async (csv, proxy) => {
  randomGender = parseInt(Math.random() * (3 - 1) + 1)
  randomDays = parseInt(Math.random() * (30 - 1) + 1)
  randomMonths = parseInt(Math.random() * (12 - 1) + 1)
  randomYears = parseInt(Math.random() * (2000 - 1975) + 1975)

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
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://www.shuzulab.com/en/login?back=my-account',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': '250',
        'Upgrade-Insecure-Requests': '1',

      },
      method: 'POST',
      timeout:15000,
      url: 'https://www.shuzulab.com/en/login',
      proxy: proxyconfig,

      data: qs.stringify({
        idgender: '1',
        customer_firstname: csv.FirstName,
        customer_lastname: csv.LastName,
        email: csv.Email,
        passwd: csv.Password,
        days: randomDays,
        months: randomMonths,
        years: randomYears,
        company: '',
        siret: '',
        ape: '',
        website: '',
        'psgdpr-consent': '1',
        email_create: '1',
        is_new_customer: '1',
        back: 'my-account',
        submitAccount: '',
      }),
    })
   
    return 1
  } catch (err) {
    console.log(err)
    return -1
  }
}

const getSignature = async (id, proxy) => {
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

  proxyconfig = {
    host: '127.0.0.1',
    port: '8888'
  }

  try {
    const resp = await axios({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json; charset=UTF-8'
      },
      proxy: proxyconfig,
      timeout:10000,
      method: 'POST',
      url: 'https://yj2zma29c8g.typeform.com/forms/' + id + '/start-submission',
    })

    
    return resp.data
  } catch (err) {
    console.log(err)
    return -1
  }
}

const finishTypeform = async (id, signature, form, starttime, proxy) => {
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

  proxyconfig = {
    host: '127.0.0.1',
    port: '8888'
  }
  // 
  try {
    const resp = await axios({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json; charset=UTF-8'
      },
      method: 'POST',
      proxy: proxyconfig,
      timeout:10000,
      url:
        'https://yj2zma29c8g.typeform.com/forms/' + id + '/complete-submission',
      data: {
        signature,
        form_id: id,
        landed_at: starttime,
        "answers": [
          {
            "field": {
              "id": form.name.id,
              "type": "short_text"
            },
            "type": "text",
            "text": form.name.name
          },
          {
            "field": {
              "id": form.email.id,
              "type": "email"
            },
            "type": "email",
            "email": form.email.email
          },
          {
            "field": {
              "id": form.size.id,
              "type": "multiple_choice"
            },
            "type": "choices",
            "choices": [
              {
                "id": form.size.size.id,
                "label": form.size.size.label
              }
            ]
          },
          {
            "field": {
              "id": form.country.id,
              "type": "dropdown"
            },
            "type": "text",
            "text": form.country.country
          },
          {
            "field": {
              "id": form.shipping.id,
              "type": "multiple_choice"
            },
            "type": "choices",
            "choices": [
              {
                "id": form.shipping.ship,
                "label": "HOME DELIVERY",
              }
            ]
          }
        ]
      }
    });
    return 0
  } catch (err) {
    console.log(err)
    return -1
  }
}
const getTypeformData = async (id) => {
  try {
    const resp = await axios({
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Language": "fr,en-US;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
      },
      method: 'GET',
      timeout:3000,
      url: `https://themintcompany.typeform.com/to/${id}`,
    })
    a = resp.data
  

    form = a.split("rootDomNode: 'root',")[1].split(';')[0]
    form = extract(form)
    return form[0]

  } catch (err) {
    console.log(err)
    return -1
  }
}
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getRaffleId() {
  let idShuzu
  const connection = mysql.createConnection({
    host: '185.31.40.53',
    user: 'orion',
    password: '785421BG',
    database: 'orion_user',
  })

  connection.connect()
  q = `SELECT idRaffle from website where website="shuzu"`

  connection.query(q, (error, results) => {
    if (error) throw error

    idShuzu = results
  })
  await sleep(1500)
  connection.end()
  return idShuzu
}


// main()
module.exports = {
  register,
  genAccountFunction,
  getTypeformData,
  getRaffleId,
  getSignature,
  finishTypeform
}
