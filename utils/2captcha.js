const Captcha = require("2captcha");

async function solveReCaptcha(apiKey, captcha, url, callback) {
    const solver = new Captcha.Solver(apiKey)

    solver.recaptcha(captcha, url)
        .then((res) => {callback(res.data);});
}

module.exports = {
    solveReCaptcha
}