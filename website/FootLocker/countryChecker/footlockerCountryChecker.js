
const inputReader = require('wait-console-input');
const figlet = require("figlet")
const colors = require("colors")
const clear = require('console-clear');
const setTitle = require('node-bash-title');
const chalk = require('chalk');
var readline = require('readline');
const fs = require("fs")
const lineReader = require('line-reader');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const path = require("path");
const { registerFTL } = require('../footlockerRegisterFunction')
const { csvrafflereaderFootshop, csvproxyreader, csvconfigreader } = require('../../../init');


function pad(num) {
    return ("0" + num).slice(-2);
}
async function date() {

    const date_ob = new Date();
    var seconds = date_ob.getSeconds();
    var minutes = date_ob.getMinutes();
    var hour = date_ob.getHours();

    // prints date & time in YYYY-MM-DD format
    return `[${pad(hour)}:${pad(minutes)}:${pad(seconds)}]`

}



function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}

async function pourcentage(i, length, version, success) {

    instance = process.cwd()
    instance = instance.split("\\").pop()

    if (length == 0) {
        a = 0
    } else {
        a = (i + 1) / length
    }

    setTitle(`OrionRaffle | Instance /${instance} | Private Beta | V.${version} | ${parseInt(a * 100)}% | Success : ${success} | Failed : ${i - success}`);
}


async function footlockerCountryChecker(version) {

    proxylist = await csvproxyreader()
    await sleep(500)

    clear()
    console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
    console.log(chalk.rgb(247, 158, 2)("\n FootLocker Instore | Country Checker"))
    console.log("-----------------------------------------------------\n")

    for (let i = 0; i < 100; i++) {
        registerFTL(proxylist[0])
    }

    await sleep(100000000)
}


module.exports = {
    footlockerRegister
}