const path = require('path')
const { csvReadProxy } = require(path.join(__dirname, 'csvReader'))
const { sleep } = require(path.join(__dirname, 'utils'))

async function getRandomProxy() {
    var proxy;
    async function callback(proxies) {
        proxy = proxies[Math.floor(Math.random()*proxies.length)]
    }
    await csvReadProxy(callback);
    await sleep(200);
    if (proxy === undefined) throw 'Error proxy';
    else return proxy;
}

module.exports = {
    getRandomProxy
}