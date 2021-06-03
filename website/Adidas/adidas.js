const axios = require('axios-https-proxy-fix');

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;



const session = async () => {

  proxyconfig = {
    host: '127.0.0.1',
    port: '8888',
  }
  try {
    const resp = await axios({

      headers: {
        'user-agent': 'FLEU/CFNetwork/Darwin',
        "Accept": "application/hal+json",
        "Accept-Language": "fr-FR",
        'x-api-key':	'qbSxC4cM5zqtyJ14pPIKZQFN',
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-device-info' :'app/CONFIRMED; os/iOS; os-version/14.2; app-version/2.1.0; buildnumber/2021.3.19.14.8; type/iPhone11,2; fingerprint/ABEFD527-BA4A-413B-B7B1-B97EEBE8D67E'


      },
      proxy:proxyconfig,
      method: 'GET',
      url: 'https://api.3stripes.net/gw-api/v2/user/lookup?id=hhvjdh@gmail.com',

    })

    return resp
  } catch (err) {
    console.log(err)

  }

}

const register = async () => {

    proxyconfig = {
      host: '127.0.0.1',
      port: '8888',
    }
    try {
      const resp = await axios({
  
        headers: {
           'user-agent'	:'confirmed/2021.3.19.14.8 CFNetwork/1206 Darwin/20.1.0',
          "Accept": "application/hal+json",
          "Accept-Language": "fr-FR",
          'x-api-key':	'qbSxC4cM5zqtyJ14pPIKZQFN',
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          'x-market':'FR',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'x-device-info' :'app/CONFIRMED; os/iOS; os-version/14.2; app-version/2.1.0; buildnumber/2021.3.19.14.8; type/iPhone11,2; fingerprint/ABEFD527-BA4A-413B-B7B1-B97EEBE8D67E',
          'Cookie':cookie,
          'x-acf-sensor-data':'1,i,AAeCVcyg/2yu9j6x+vzN9HydmCBZuWZeHyJGQtH/YXakkgW7cWCk9JPtKcFVJi74JFIMm/F16MjcJqCc7b0LsWYlqxpVOPQN6KBXKnPPyjoo1xpUfa4vKPbdjtwjmM/43quXm1PucsiMDf5V5Cy2otKQJX+INj4QhiWjY62YFgE=,FjphP9WY57oOo24UUMVfwFJvicySV7xKtEVI7Wy0eeIW25GJAACv718IKEOurkm6tC7XVqQAnnhfDBgeF0eo7HBXoPRtelphm0kcxufeqb8gCbvF7CUWejbUglLYEzaf6553WyAiRB0r9GksrWfEHns91AhRvd9YoXzzP+oGsP8=$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6tuvWirjsxADqnmyzGyvn7L4AS5dsSnDllcxtZH4SjXHI5nFt6TxzmACQYrdm8D0LZpnzNwNG8icY92NggsrFVsmikApXjUgHao00WyONc96nYjCjhj8yDMu2mhvPQFs/Z0/2CqdnDjrwN0TZYRLr0ujaCATueail2EQSMGat+mmMSC2+8og/YboH5uh7tF61L8QYEol/MjwtdqL4pSKNWmAYbPvOlAFfWVPj35FVuqx2z5aOy7AAks/NQHDFQK8DRnGcrIteoZqgd8Z2lNGBewAkxFsKMSbE1WMZ6PhPfL0Izqznr8oQSwOPd0x1OBtI3YY01Zuz050YWpWzNudQQL85oPep2zJe0uabe+dl241mrF577P1BaDd62ThXM9gfpTotAObS7EDET3aga7hTmUWOTOissMl0LjdHVhuxCcdesyjz6DXCISwrAflcil8LbThZAzANdurCkFB4rlFfUqM640M7VCFne7PcKcg+45nkAnLthksMCrcqm1Ujb1RVVo3tBh98KQDmQLoufCxQ/o0nzOvpIXdhG22lZrIMktMLK8Yz4k7POOqarCMP+VVxRTSyxpOKewBDktQE2zQgRJIPzraihWrAT528HBN3G1jqZWPBy0Kd8Rf+pFUY7MYY5D77pipMweVgmc1tanXkhGfQSZl8OIi8NDPBW5RN5Tqh+m4DhBa4emVWVDt4e19K/OLwajhOLkM4wr9$14,5,24',
        
            
  
        },
        proxy:proxyconfig,
        method: 'POST',
        url: 'https://api.3stripes.net/gw-api/v2/user',
        data:{
            "email": "hhvjdh@gmail.com",
	        "membership_consent": true,
	        "password": "!Yoloyolo63!"
        }
  
      })
  
      console.log(resp)
    } catch (err) {
      console.log(err)
  
    }
  
  }

async function main(){

    resp = await session()
    cookie = resp.headers['set-cookie'][0]
    cookie = cookie.split(';')[0]
    console.log(cookie)
    await register(cookie)
}

main()
