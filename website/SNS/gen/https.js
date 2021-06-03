const LZString = require('./lib');
const { URL } = require('url');
const Captcha = require("2captcha")
const axios = require('axios-https-proxy-fix');


const request = require('request-promise').defaults({
    jar: true
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const proxyCharles = 'http://127.0.0.1:8888'

// API auth
const auth = {
    "auth": "ce8a6fc7-f5d5-4530-8a73-b5e70e9b81ad"
}

// set needed varibles for later
var host;
var isCaptcha = false;
var isRerun = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// set needed headers
function getGetHeaders() {
    let getHeaders = {
        "Host": `${host}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "deflate",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
    }

    return getHeaders
}

function getFinalHeaders() {
    let finalHeaders = {
        "Host": `${host}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": `https://${host}`,
        "Connection": "keep-alive",
        "Referer": `https://${host}/`,
        "Upgrade-Insecure-Requests": "1",
    }

    return finalHeaders
}

function getChallengeHeaders() {
    let challengeHeaders = {
        "Host": `${host}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-type": "application/x-www-form-urlencoded",
        "CF-Challenge": responseHawkApiPart1["url"].split("/").slice(-1),
        "Origin": `https://${host}`,
        "Connection": "keep-alive",
        "Referer": `https://${host}/`,
    }

    return challengeHeaders
}

async function getPage(url) {
    host = new URL(url).host;

    const response = await request({
        method: "GET",
        uri: url,
        resolveWithFullResponse: true,
        headers: getGetHeaders(),
        simple: false,
        proxy: proxyCharles
    });

    if(response.statusCode === 503) {
        isCaptcha = false;
    } else if(response.statusCode === 403) {
        isCaptcha = true;
    }

    orginalResponse = response;
    return response;
}

async function getChallengeJs() {
    let scriptUrl;

    if(isCaptcha) {
        scriptUrl = `https://${host}/cdn-cgi/challenge-platform/h/g/orchestrate/captcha/v1`
    } else {
        scriptUrl = `https://${host}/cdn-cgi/challenge-platform/h/g/orchestrate/jsch/v1`
    }

    const response = await request({
        method: "GET",
        uri: scriptUrl,
        resolveWithFullResponse: true,
        headers: getGetHeaders(),
        simple: false,
        proxy: proxyCharles
    })

    let regex = /0\.[^('|/)]+/;
    let matchs = response.body.match(regex)
    urlPart = matchs[0];

    regex = /[\W]?([A-Za-z0-9+\-$]{65})[\W]/g;
    let matches = response.body.matchAll(regex);
    matches = Array.from(matches)
    let matchString;

    for(let i = 0; i < matches.length; i++) {
        matchString = matches[i][1].replace(/,/g, "")

        if(matchString.includes("+") && matchString.includes("-") && matchString.includes("$")) {
            keyStrUriSafe = matchString
            break
        }
    }
}

async function callToCloudflareApi(result) {
    let decodedApiResponse = Buffer.from(result, "base64").toString()

    let payload = {}
    payload[responseHawkApiPart1["name"]] = LZString.compressToEncodedURIComponent(decodedApiResponse, keyStrUriSafe)

    const response = await request({
        method: "POST",
        uri: responseHawkApiPart1["url"],
        resolveWithFullResponse: true,
        headers: getChallengeHeaders(),
        simple: false,
        form: payload,
        proxy: proxyCharles,
        encoding: "UTF-8"
    })
    
    challengeResponse = response

    console.log(challengeResponse.statusCode)
}

async function callToHawkApiPart1() {
    let buff = Buffer.from(orginalResponse.body).toString("base64")

    let payload = {
        "body": buff,
        "url": urlPart,
        "domain": host,
        "captcha": isCaptcha
    }

    const response = await request({
        method: "POST",
        uri: "https://cf-v2.hwkapi.com/cf-a/ov1/p1",
        resolveWithFullResponse: true,
        simple: false,
        body: payload,
        json: true,
        proxy: proxyCharles,
        qs: auth
    })

    responseHawkApiPart1 = response.body
    
    return await callToCloudflareApi(responseHawkApiPart1["result"])
}

async function callToHawkApiPart2() {
    if(!isRerun) {
        payload = {
            "body_home": Buffer.from(orginalResponse.body).toString("base64"),
            "body_sensor": Buffer.from(challengeResponse.body).toString("base64"),
            "result": responseHawkApiPart1["baseobj"],
            "ts": responseHawkApiPart1["ts"],
            "url": responseHawkApiPart1["url"],
        }
    } else {
        payload = {
            "body_home": Buffer.from(orginalResponse.body).toString("base64"),
            "body_sensor": Buffer.from(challengeResponse.body).toString("base64"),
            "result": responseHawkApiPart1["baseobj"],
            "ts": responseHawkApiPart1["ts"],
            "url": responseHawkApiPart1["url"],
            "rerun": true,
            "rerun_base": responseHawkApiPart2["result"]
        }

    }

    const response = await request({
        method: "POST",
        uri: "https://cf-v2.hwkapi.com/cf-a/ov1/p2",
        resolveWithFullResponse: true,
        simple: false,
        body: payload,
        json: true,
        proxy: proxyCharles,
        qs: auth
    })

    responseHawkApiPart2 = response.body

    return await callToCloudflareApi(responseHawkApiPart2["result"])
}

async function callToHawkApiPart3() {
    let payload = {
        "body_sensor": Buffer.from(challengeResponse.body).toString("base64"),
        "result": responseHawkApiPart1["baseobj"]
    }

    const response = await request({
        method: "POST",
        uri: "https://cf-v2.hwkapi.com/cf-a/ov1/p3",
        resolveWithFullResponse: true,
        simple: false,
        body: payload,
        json: true,
        proxy: proxyCharles,
        qs: auth
    })

    responseHawkApiPart3 = response.body
    if(responseHawkApiPart3["status"] == "ok" && responseHawkApiPart3["captcha"] == false) {
        finalPayload = {
            "r": responseHawkApiPart1["r"],
            "jschl_vc": responseHawkApiPart3["jschl_vc"],
            "pass": responseHawkApiPart1["pass"],
            "jschl_answer": responseHawkApiPart3["jschl_answer"],
            "cf_ch_verify": "plat"
        }
    } else if(responseHawkApiPart3["status"] == "rerun") {
        isRerun = true
        await callToHawkApiPart2()
        await callToHawkApiPart3()
    } else if(responseHawkApiPart3["captcha"] == true) {
        await callToHawkApiCaptchaPart1()
        await callToHawkApiCaptchaPart2()
    }
}

async function callToHawkApiCaptchaPart1() {
    let token

    if(responseHawkApiPart3["click"]) {
        token = "click"
    } else {
        token = "yourtoken" // in here you need to implement your source of captcha token which could be 2 cap, anti cap etc.
    }

    let payload = {
        "result": responseHawkApiPart2["result"],
        "token": token,
        "data": responseHawkApiPart3["result"]
    }

    const response = await request({
        method: "POST",
        uri: "https://cf-v2.hwkapi.com/cf-a/ov1/cap1",
        resolveWithFullResponse: true,
        simple: false,
        body: payload,
        json: true,
        proxy: proxyCharles,
        qs: auth
    })
    
    responseHawkApiCaptchaPart1 = response.body

    await callToCloudflareApi(responseHawkApiCaptchaPart1["result"])
}

async function callToHawkApiCaptchaPart2() {
    payload = {
        "body_sensor": Buffer.from(challengeResponse.body).toString("base64"),
        "result": responseHawkApiPart1["baseobj"]
    }

    const response = await request({
        method: "POST",
        uri: "https://cf-v2.hwkapi.com/cf-a/ov1/cap2",
        resolveWithFullResponse: true,
        simple: false,
        body: payload,
        json: true,
        proxy: proxyCharles,
        qs: auth
    })
    captcha_response = response.body
    if(captcha_response["valid"]) {
        finalPayload = {
            "r": responseHawkApiPart1["r"],
            "cf_captcha_kind": "h",
            "vc": responseHawkApiPart1["pass"],
            "captcha_vc": captcha_response["jschl_vc"],
            "captcha_answer": captcha_response["jschl_answer"],
            "cf_ch_verify": "plat",
            "h-captcha-response": "captchka"
        }
    }
}

async function postFinal() {
    await sleep(4000);

    const response = await request({
        method: "POST",
        uri: responseHawkApiPart1["result_url"],
        resolveWithFullResponse: true,
        simple: false,
        form: finalPayload,
        proxy: proxyCharles,
        headers: getFinalHeaders()
    })

    console.log(response.statusCode)
}

async function postFinal() {
    await sleep(4000);

    const response = await request({
        method: "POST",
        uri: responseHawkApiPart1["result_url"],
        resolveWithFullResponse: true,
        simple: false,
        form: finalPayload,
        proxy: proxyCharles,
        headers: getFinalHeaders(),
        
    })
    
    console.log(response.statusCode)
   
    // a = (response.headers.toString('content-type'))
    a = response.headers['set-cookie'][3]
    a = a.split("=")[1]
    a = a.split(';')[0]
    return a 
}

async function submit(token,csrf) {
    await sleep(4000);

    const response = await request({
        method: "POST",
        uri: "https://www.sneakersnstuff.com/fr/auth/submit",
        resolveWithFullResponse: true,
        simple: false,
        form: {
            "_AntiCsrfToken": csrf,
            "action" : "register",
            "firstName" : "Zeub",
            "email" : "tonrfrgth@mail.com",
            "password": "yoloyolo",
            "g-recaptcha-response":token

        },
        proxy: proxyCharles,
        headers: getFinalHeaders(),
        data: JSON.stringify({
            "_AntiCsrfToken": csrf,
            "action" : "register",
            "firstName" : "Zeub",
            "email" : "tonrrth@mail.com",
            "password": "yoloyolo",
            "g-recaptcha-response":token

        })
        
    })
}

async function run() {
    await getPage('https://www.sneakersnstuff.com/en/auth/view?op=register')
    console.log("t")
    await getChallengeJs()
    await callToHawkApiPart1()
    await callToHawkApiPart2()
    await callToHawkApiPart3()
    csrf = await postFinal()
    token = await hcaptcha('18fd783e9ec10c948ecc7b259c5fc92e')
    await submit(token,csrf)
}

run()