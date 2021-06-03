const { URL } = require('url');
const request = require('request-promise').defaults({
    jar: true
});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const proxyCharles = {
    host: "fr-static-1.resdleafproxies.com",
    port: "19591",
    auth: {
      username: "353626+FR+353626-696063",
      password: "hbotajeu31ji6cv"
    }
  }

// API auth
const auth = {
    "auth": "test_1fdcce24-5733-42a2-8313-04e590cd3393"
}

// set needed varibles for later
var host;

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
    urlPath = orginalResponse.body.split('<script src="')[3].split('"')[0]
    initUrl = "https://" + host + urlPath
    
    const response = await request({
        method: "GET",
        uri: initUrl,
        resolveWithFullResponse: true,
        headers: getGetHeaders(),
        simple: false,
        proxy: proxyCharles
    })

    challengeResponse = response
}

async function callToCloudflareApi(result) {

    const response = await request({
        method: "POST",
        uri: responseHawkApiPart1["url"],
        resolveWithFullResponse: true,
        headers: getGetHeaders(),
        simple: false,
        body: result,
        json: true,
        proxy: proxyCharles,
        encoding: "UTF-8"
    })
    
    challengeResponse = response

    console.log(challengeResponse.statusCode)
}

async function callToHawkApiPart1() {
    let payload = {
        "body": Buffer.from(challengeResponse.body).toString("base64"),
        "url": initUrl
    }
    const response = await request({
        method: "POST",
        uri: "https://cf-v2.hwkapi.com/cf-a/fp/p1",
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

async function run() {
    await getPage("https://www.sneakersnstuff.com/")
    await getChallengeJs()
    await callToHawkApiPart1()
    response = await getPage("https://www.sneakersnstuff.com/")
    console.log(response.statusCode)
}

run()