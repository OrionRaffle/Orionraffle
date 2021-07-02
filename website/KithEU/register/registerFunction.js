const axios = require('axios-https-proxy-fix')
const qs = require('qs')
const request = require('request-promise').defaults({
    jar: true
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


//Create Account Function
const createAccount = async (proxyConfig, user) => {
    // proxyConfig = 'http://16206265723739:hUo13ZOuhX74fN1i_country-France_session-162334362716@proxy.frappe-proxies.com:31112'

    // var proxyConfig = {
    //     host: '127.0.0.1',
    //     port: '8888',
    // }
    try {

        const response = await request({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',


                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',

            },
            proxy: proxyConfig,
            resolveWithFullResponse: true,
            maxRedirects: 1,
            followAllRedirects: true,
            withCredentials: true,
            method: 'POST',
            uri: `https://eu.kith.com/account`,

            body: qs.stringify({
                'form_type': 'create_customer',
                'utf8': '✓',
                'customer[first_name]': user.FirstName,
                'customer[last_name]': user.LastName,
                'customer[email]': user.Email,
                'customer[password]': user.Password
            })
        })

        //Trigger le challenge, donc il faut switch de proxy (flem de faire le captcha)
        if (response.body.includes('eu.kith.com/challenge')) {
            console.log("Bad proxy, trigger challenge, rotating proxy..")
            return true
        }
        // il y a une redirection /register (compte existe déjà)
        if (response.body.includes('eu.kith.com/account/register')) {
            console.log("Account doesn't exist")
            return true
        }
        //Check si l'on est bien sur eu.kith.com cela signifi qu'on est bien connecté / Récupération du sessionId pour accéder aux autres pages
        if (response.body.includes('eu.kith.com/"')) {
            console.log("Account generate with success")
            user.sessionId = response.request.headers['cookie'].split(';')[0].split('=')[1]
            console.log("SessionId : " + user.sessionId)
            return false
        }

    } catch (err) {
        console.log(err)

    }
}

//Update ACCOUNT
const update = async (proxyConfig, user) => {
    // proxyConfig = 'http://16206265723739:hUo13ZOuhX74fN1i_country-France_session-162334362716@proxy.frappe-proxies.com:31112'

    // var proxyConfig = {
    //     host: '127.0.0.1',
    //     port: '8888',
    // }
    try {

        const response = await request({
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Connection": "keep-alive",
                'Content-Type': 'application/x-www-form-urlencoded',
                'cookie': '_secure_session_id=' + user.sessionId

            },
            proxy: proxyConfig,
            resolveWithFullResponse: true,
            method: 'POST',
            uri: `https://eu.kith.com/account/addresses`,

            body: qs.stringify({
                'form_type': 'customer_address',
                'utf8': '✓',
                'address[first_name]': user.FirstName,
                'address[last_name]': user.LastName,
                'address[company]': '',
                'address[address1]': user.Address,
                'address[address2]': '',
                'address[country]': user.Country,
                'address[city]': user.City,
                'address[zip]': user.Zip,
                'address[phone]': "06" + Math.floor((Math.random() * 90000000) + 10000000)
            })
        })

        // console.log(response)

    } catch (err) {
        // console.log(err)

    }
}

async function register(user) {
    proxyConfig = 'http://16206265723739:hUo13ZOuhX74fN1i_country-France_session-162334362724@proxy.frappe-proxies.com:31112'

    //Ligne du CSV == user
    user = {
        'Email': 'abcder6@gmail.com',
        'Password': 'yoloyolo',
        'FirstName': 'Mickey',
        'LastName': 'Mouse',
        'Address': '25 rue de ton daron',
        'Country': 'France',
        'City': 'Clermont',
        'Zip': '63000'
    }
    error = await createAccount(proxyConfig, user)
    if (error) return
    await update(proxyConfig, user)

}
register()


