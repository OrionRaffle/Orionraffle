const Captcha = require("2captcha");
const { csvReadClientAuth } = require("./csvReader");

async function solveReCaptcha(siteKey, url, callback) {
    await new Promise(async function(resolve) {
        await csvReadClientAuth(async function (data) {
            const solver = new Captcha.Solver(data.Key2Captcha)
    
            solver.recaptcha(siteKey, url)
                .then(async (res) => {
                    res = await callback(res.data); 
                    resolve(res); 
                });
        });
    })
}


/*
http://2captcha.com/in.php?
key=1abc234de56fab7c89012d34e56fa7b8 OK
&method=userrecaptcha OK
&googlekey=6Le-wvkSVVABCPBMRTvw0Q4Muexq1bi0DJwx_mJ- OK
&pageurl=http://mysite.com/page/with/recaptcha OK
*/

module.exports = {
    solveReCaptcha
}