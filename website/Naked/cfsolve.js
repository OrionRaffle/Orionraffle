const requeest = require('request');
const utf8 = require('utf8');
const base64 = require('base-64');
const LZString = require('./lzstring')
const ffi = require('ffi-napi')
const chalk = require('chalk');
const timestamp = require('time-stamp');

const gothing = ffi.Library('tlsexpert', {
    'request': ['string', ['string']]

})

function request(url, method, cHello, proxy, body, headers, timeout, followRedirects){
    enc = JSON.stringify({"url":url,"method":method,"cHello":cHello,"proxy":proxy,"body":body,"headers":headers,"timeout":timeout,"followRedirects":followRedirects})
    value = gothing.request(utf8.encode(enc))
    return value
}

const VALID_CLIENT_HELLOS = [
    'Firefox_55',
    'Firefox_56',
    'Firefox_63',
    'Firefox_65',
    'Chrome_58',
    'Chrome_62',
    'Chrome_70',
    'Chrome_72',
    'Chrome_83',
    'IOS_11_1',
    'IOS_12_1',
]



async function literalMain(){

    try{

        var first = firstFunc()

        originalBody = first[0]
        cookieJar = first[1]

        var v1Res = v1Req(originalBody, cookieJar)

        keyStrUriSafe = v1Res[0]
        matches = v1Res[1]

        
        apiRes1 = await apiReq1(matches, originalBody).then(function(res) {
            return res
        })  

        var endpointRes1 = endpointReq1(apiRes1, keyStrUriSafe, cookieJar)

        endpointBody = endpointRes1[0]
        cookieJar = endpointRes1[1]

        result = await apiReq2(originalBody, apiRes1, endpointBody).then(function(res) {
            return res
        })  


        var text = endpointReq2(apiRes1, keyStrUriSafe, cookieJar, result)

        apiRes3 = await apiReq3(text, apiRes1, endpointBody).then(function(res) {
            return res
        })  

        if (apiRes3.status == "rerun"){
            console.log("Restarting")
            literalMain()
        }

        else{
            finalRes = await finalReq(apiRes3, cookieJar, apiRes1)
            if (finalRes != null){
                return finalRes
            }
        }

    } catch(err){
        await mainT()
    }
    

    



}

 

function firstFunc(){


    try{
        res = request("https://en.aw-lab.com/on/demandware.store/Sites-awlab-en-Site/en_GB/Cart-AddProduct?format=ajax", "GET", "Chrome_83", 'http://127.0.0.1:8888', '',  {
            'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
            'content-type': 'application/x-www-form-urlencoded',
            'accept': '*/*',
            'origin': 'https://en.aw-lab.com/',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://en.aw-lab.com/men/shoes/nike-air-jordan-1-mid-AW_846ZJLJA_8046754_11.html',
            'accept-language': 'en-US,en;q=0.9',
        }, 10000, true)


        cookieJar = (JSON.parse(res)).headers['Set-Cookie'].split("; expires")[0]
        body = (JSON.parse(res)).body

        return [body, cookieJar]

    } catch(err){
        mainT()
    }

}

function v1Req(originalBody, cookieJar){

    try{
        res = request('https://en.aw-lab.com/cdn-cgi/challenge-platform/h/g/orchestrate/jsch/v1', "GET", "Chrome_83", 'http://127.0.0.1:8888', "",  {
                'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
                'accept': '*/*',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-mode': 'no-cors',
                'sec-fetch-dest': 'script',
                'cookie': `${cookieJar};`,
                'referer': 'https://en.aw-lab.com/on/demandware.store/Sites-awlab-en-Site/en_GB/Cart-AddProduct?format=ajax',
                'accept-language': 'en-US,en;q=0.9',
            }, 10000, true)

        body = (JSON.parse(res)).body
        var re = /0\.[^('|/)]+/g;
        var matches = []
        let match = null
        do {
            match = re.exec(body)
            if (match){
                matches.push(match[0])
            }
        } while (match)

        var re = /[\W]?([A-Za-z0-9+\-$]{65})[\W]/g
        do {
            match = re.exec(body)
            if (match){
                matches.push(match[0])
            }
        } while (match)

        let news = matches[1].split(",")
        neww = news[1]

        matches[1] = neww
        for (i in matches){

            if (matches[i] == null){
                break
            }
            
            if (matches[i].includes("+") && matches[i].includes("-") && matches[i].includes("$")){
                var keyStrUriSafe = matches[i]
                break
            }
        }


        return [keyStrUriSafe, matches]

    } catch(err){
        mainT()
    }
}


function apiReq1(matches, originalBody){

    try{
        return new Promise(function (resolve, reject) {
            var ting = base64.encode(utf8.decode(utf8.encode(originalBody))).toString()

            var payload = {
                "body": ting,
                "url": matches[0],
                "domain": "en.aw-lab.com",
                "captcha": false
            }

            var options = {
                method: "POST",
                url: "https://cf-v2.hwkapi.com/cf-a/ov1/p1?auth=15613076-d528-421e-af99-672947bcfb7b",
                json: payload,
                proxy:'http://127.0.0.1:8888',
                strictSSL: false
            };
            

            requeest(options, function (error, response, body) {

                aa = body
                url = aa.url
                request_url = aa.result_url
                result = aa.result
                namee = aa.name
                baseobj = aa.baseobj
                request_pass = aa.pass
                request_r = aa.r
                ts = aa.ts

                stuff = {
                    "aa": aa,
                    "url": url,
                    "request_url": request_url,
                    "result": result,
                    "name": namee,
                    "baseobj": baseobj,
                    "request_pass": request_pass,
                    "request_r": request_r,
                    "ts": ts,

                }
                resolve(stuff)  

            })

        })

    } catch(err){
        mainT()
    }
}


function endpointReq1(apiRes1, keyStrUriSafe, cookieJar){

    try{
        var payload = `${apiRes1.name}=${(LZString.compressToEncodedURIComponent(base64.decode(apiRes1.result), keyStrUriSafe))}`


        res = request(apiRes1.url, "POST", "Chrome_83", 'http://127.0.0.1:8888', payload,  {
            'Host': 'en.aw-lab.com',
            'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
            "cf-challenge": ((apiRes1.url).split("/")).slice(-1)[0],
            'content-type': 'application/x-www-form-urlencoded',
            'accept': '*/*',
            'origin': 'https://en.aw-lab.com',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'cookie': `${cookieJar};`,
            'sec-fetch-dest': 'empty',
            'referer': 'https://en.aw-lab.com/on/demandware.store/Sites-awlab-en-Site/en_GB/Cart-AddProduct?format=ajax',
            'accept-language': 'en-US,en;q=0.9',
        }, 10000, true)




        body = (JSON.parse(res)).body
        cookie = (JSON.parse(res)).headers['Set-Cookie'].split(";SameSite")[0]
        cookieJar = cookieJar + "; " + cookie + ";"

        return [body, cookieJar]
    } catch(err){
        mainT()
    }

}


function apiReq2(originalBody, apiRes1, endpointBody){

    try{
        return new Promise(function (resolve, reject) {

            var payload = {
                "body_home": Buffer.from(originalBody).toString('base64'),
                "body_sensor": Buffer.from(endpointBody).toString('base64'),
                "result": apiRes1.baseobj,
                "ts": apiRes1.ts,
                "url": apiRes1.url,
            }


            var options = {
                method: "POST",
                url: "https://cf-v2.hwkapi.com/cf-a/ov1/p2?auth=15613076-d528-421e-af99-672947bcfb7b",
                json: payload,
                proxy:'http://127.0.0.1:8888',
                strictSSL: false
            };
            

            requeest(options, function (error, response, body) {

                result = body.result

                resolve(result)  

            })

        })
    } catch(err){
        mainT()
    }
    
}



function endpointReq2(apiRes1, keyStrUriSafe, cookieJar, result){

    try{
        var payload = `${apiRes1.name}=${(LZString.compressToEncodedURIComponent(base64.decode(result), keyStrUriSafe))}`


        res = request(apiRes1.url, "POST", "Chrome_83", 'http://127.0.0.1:8888', payload,  {
            'Host': 'en.aw-lab.com',
            'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
            "cf-challenge": ((apiRes1.url).split("/")).slice(-1)[0],
            'content-type': 'application/x-www-form-urlencoded',
            'accept': '*/*',
            'origin': 'https://en.aw-lab.com',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'cookie': `${cookieJar};`,
            'sec-fetch-dest': 'empty',
            'referer': 'https://en.aw-lab.com/on/demandware.store/Sites-awlab-en-Site/en_GB/Cart-AddProduct?format=ajax',
            'accept-language': 'en-US,en;q=0.9',
        }, 10000, true)




        let text = JSON.parse(res).body

        return text
    } catch(err){
        mainT()
    }
}


function apiReq3(text, apiRes1, endpointBody){

    try{
        return new Promise(function (resolve, reject) {

            var payload = {
                "body_sensor": Buffer.from(text).toString('base64'),
                "result": apiRes1.baseobj,
            }

        

            var options = {
                method: "POST",
                url: "https://cf-v2.hwkapi.com/cf-a/ov1/p3?auth=15613076-d528-421e-af99-672947bcfb7b",
                json: payload,
                proxy:'http://127.0.0.1:8888',
                strictSSL: false
            };
            

            requeest(options, function (error, response, body) {


                resolve(body)  

            })

        })

    } catch(err){
        mainT()
    }

    
}


async function finalReq(apiRes3, cookieJar, apiRes1){
    
    try{
        await sleep(2000);

        var payload = (`r=${encodeURIComponent(apiRes1.request_r)}&jschl_vc=${apiRes3.jschl_vc}&pass=${apiRes1.request_pass}&jschl_answer=${apiRes3.jschl_answer}&cf_ch_verify=plat`)


        res = request(apiRes1.request_url, "POST", "Chrome_83", 'http://127.0.0.1:8888', payload,  {
            'Host': 'en.aw-lab.com',
            'cache-control': 'max-age=0',
            'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'upgrade-insecure-requests': '1',
            'origin': 'https://en.aw-lab.com',
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-dest': 'document',
            'referer': 'https://en.aw-lab.com/on/demandware.store/Sites-awlab-en-Site/en_GB/Cart-AddProduct?format=ajax',
            'accept-language': 'en-US,en;q=0.9',
            'Cookie': cookieJar
        }, 10000, true)
        
        cookieJar = (JSON.parse(res)).headers['Set-Cookie']
        if (cookieJar == null){
            literalMain()
        }

        else{
            return cookieJar
        }
    } catch(err){
        mainT()
    }

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function mainT(){
    console.log(chalk.green.bold(timestamp.utc('[YYYY/MM/DD:mm:ss:ms] ')) + (chalk.blue.bold('BEGIN')))
    console.log(await literalMain())
    console.log(chalk.green.bold(timestamp.utc('[YYYY/MM/DD:mm:ss:ms] ')) + (chalk.blue.bold('END')))

}

mainT()
