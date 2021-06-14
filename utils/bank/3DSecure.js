const path = require('path');
const { handleLydia3DSecure } = require(path.join(__dirname, 'lydia'));

async function handle3DSecure(data, proxy) {
    const pareq = data.split('value="')[1].split('"')[0];
    const stripeLink = data.split('value="')[2].split('"')[0];
    const formLink = data.split('action="')[1].split('"')[0];
    //LYDIA
    if (data.split('method="POST" action="')[1].includes('-acs.marqeta.co')) {
        await handleLydia3DSecure(pareq, formLink, stripeLink, proxy);
    } //REVOLUTE
    else if (data.split('method="POST" action="')[1].includes('touchtechpayments.com')) {

    } //QUONTO
    else if (data.includes("3dsecure.monext.fr")) {

    } else {
        console.log(colors.brightRed("[Error][" + numero + "][" + info.Email + "] Provider unknown, open a ticket"))
        return 0
    }
}

module.exports = {
    handle3DSecure
}