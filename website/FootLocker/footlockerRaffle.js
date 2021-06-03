
const { csvrafflereaderFootshop, csvproxyreader, csvconfigreader } = require('../../init');
// const { raffleData } = require('./footlockerEntryFunction')
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
const { setUncaughtExceptionCaptureCallback } = require('process');

function pad(num) {
    return ("0" + num).slice(-2);
}
async function date() {

    let date_ob = new Date();
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


async function footlockerRaffle(version) {

    storeAvailable = []
    storeReserved = []
    await sleep(500)

    clear()
    console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
    console.log(chalk.rgb(247, 158, 2)("\n FootLocker Instore | Raffle Mode"))
    console.log("-----------------------------------------------------\n")

    console.log("Which city ?")
    city = inputReader.readLine();
    dataRaffle = await raffleData(city)

    for (i = 0; i < dataRaffle.stores.length; i++) {
        storeAvailable.push(dataRaffle.stores[i])
    }

    clear()
    console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
    console.log(chalk.rgb(247, 158, 2)("\n FootLocker Instore | Raffle Mode"))
    console.log("-----------------------------------------------------\n")
    console.log((chalk.rgb(180, 180, 190)(city + "\n")))

    input = "yes"
    while (input == "yes") {
        if (storeReserved.length != 0) {
            clear()
            console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
            console.log(chalk.rgb(247, 158, 2)("\n FootLocker Instore | Raffle Mode"))
            console.log("-----------------------------------------------------\n")
            console.log((chalk.rgb(180, 180, 190)(city + "\n")))


            console.log(chalk.rgb(247, 158, 2)("Store already added (" + storeReserved.length + "/3)\n"))
            for (i = 0; i < storeReserved.length; i++) {
                console.log("[+] " + storeReserved[i].displayName + " / " + storeReserved[i].address.formattedAddress)
            }

            console.log("\n-------------------------------------------\n")
        }
        console.log(chalk.rgb(247, 158, 2)("Store available\n"))
        for (i = 0; i < storeAvailable.length; i++) {
            console.log(" " + (i + 1) + ". " + storeAvailable[i].displayName + " / " + storeAvailable[i].address.formattedAddress)
        }

        console.log("\n-------------------------------------------\n")


        shopChoice = inputReader.readInteger()
        await sleep(100)
        while (true) {
            if ((shopChoice <= storeAvailable.length) && (shopChoice > 0)) {
                break
            }
            shopChoice = inputReader.readLine()
        }

        storeReserved.push(storeAvailable[shopChoice - 1])
        storeAvailable.splice(shopChoice - 1, 1)

        if (storeReserved == 3) {
            console.log('Would you like to add an another store ? (yes/no)')
            input = inputReader.readLine()
            switch (input) {
                case "yes": break
                case "no": break
            }

        } else {
            input == "no"
        }
    }

    clear()
    console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
    console.log(chalk.rgb(247, 158, 2)("\n FootLocker Instore | Raffle Mode"))
    console.log("-----------------------------------------------------\n")
    console.log((chalk.rgb(180, 180, 190)(city + "\n")))


    console.log(chalk.rgb(247, 158, 2)("Selected shops\n"))
    for (i = 0; i < storeReserved.length; i++) {
        console.log("[+] " + storeReserved[i].displayName + " / " + storeReserved[i].address.formattedAddress)
    }

    console.log("\n-------------------------------------------\n")



await sleep(100000000)
}


module.exports = {
    footlockerRaffle
}