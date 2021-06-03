const ffi = require('ffi-napi')
const ref = require('ref-napi')
const axios = require('axios-https-proxy-fix');

const HTTP_LIB = ffi.Library("libja3-win.dll", {
    'request'  : ['char*', ['char*']],
    'freePtr' : ['void', ['char*']]
})

async function getCookie(){
let respBuf
try {
    respBuf = HTTP_LIB.request(ref.allocCString(JSON.stringify({
        'url' : "https://www.sneakersnstuff.com/fr/auth/view", 'proxy_url' : 'http://zdr9aeF3:1r7PRMu7D41SsT1yRyFD2Fo2jwIQtaJN8VljsMQ7fVouDKaACMLYQrzYtT3K3BAhbtO2e-FfzCPOCF@fra.resi.resdleafproxies.com:25612', 'method' : 'GET', 
        'headers': [{name: 'User-Agent', value: 'Test123'}], 'timeout': 2000, 'body' : ''
    })))

    const respStr = respBuf.readCString()
    if (respStr.indexOf('!!') == 0)
        throw new Error("unexpected error: " + respStr.substring(2))
    
 
    const resp = JSON.parse(respStr)
    if (resp['error'])
        throw new Error(resp['error_message'])

        return resp.headers
} finally {
    if (respBuf) HTTP_LIB.freePtr(respBuf)
    respBuf = null
}

}

async function Naked(cookie){
    console.log(cookie)
    try {
        const resp = await axios({
    
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
          },
        
          method: 'GET',
         
          url: 'https://www.nakedcph.com/',
         
          
        });
        console.log(resp)
    }catch(err){
        console.log(err)
    }
}

async function main(){
cookie = await getCookie()
await Naked(cookie)




}
main()