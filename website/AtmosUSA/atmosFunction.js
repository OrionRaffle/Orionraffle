const axios = require('axios-https-proxy-fix')
const qs = require('qs')
const request = require('request-promise').defaults({
    jar: true
});
const Captcha = require("2captcha")

const solver = new Captcha.Solver('18fd783e9ec10c948ecc7b259c5fc92e ');

solver.imageCaptcha(fs.readFileSync("", "base64"))
.then((res) => {
    // Logs the image text
    console.log(res)
})

const proxyConfig = {
    host: '127.0.0.1',
    port: '8888',
}
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const getRaffleInfo = async () => {
    try {
        const response = await axios({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'Origin':'https://releases.atmosusa.com'
                
                

            },
            proxy: proxyConfig,
            withCredentials: true,
            method: 'GET',
            url: `https://stage-ubiq-raffle-strapi-be.herokuapp.com/releases/active`,
           
           
        })
        return response.data
   

    } catch (err) {
        console.log(err)
    }

}
const getRaffleInfo = async () => {
    try {
        const response = await axios({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "fr-fr",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                'Origin':'https://releases.atmosusa.com'
            },
            proxy: proxyConfig,
            withCredentials: true,
            method: 'GET',
            url: `https://stage-ubiq-raffle-strapi-be.herokuapp.com/releases/active`,
        })
        return response.data
   

    } catch (err) {
        console.log(err)
    }

}

async function main(){
    let raffleTab = []
    
    raffleData = await getRaffleInfo()
    console.log(raffleData)
    for(i in raffleData){
        let raffle = {}
       
        raffle.releaseType = raffleData[i].releaseType
        raffle.name = raffleData[i].name
        raffle.style = raffleData[i].style
        raffle.price = raffleData[i].price
        raffle.sizes = raffleData[i].sizes
        raffle.stores = raffleData[i].stores
        raffleTab.push(raffle.stores)
    }
    console.log(raffleTab)
   

}
main()