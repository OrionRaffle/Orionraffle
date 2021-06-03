const inputReader = require('wait-console-input');
const figlet = require("figlet")
const colors = require("colors")
const clear = require('console-clear');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const chalk = require('chalk');
const { csvrafflereaderCourirInstore, csvproxyreader, csvconfigreader, csvCourirInstoreLog } = require('../../init')
const { courirInstoreMain, getSession } = require('./courirInstoreFunction')
const extract = require('extract-json-from-string');
const HTMLParser = require('node-html-parser');

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

colors.enable();

function discord(csv, webhook, proxy, state) {

    var link = ''
    if (state == "success") {
        color = '#18cc36'
        link = `[Add card on Phone](${csv.link})`

    } else {
        color = '#EE2016'
        link = 'No Link'
    }
    if (webhook != '') {
        if (proxy.ip == undefined) {
            proxy = "No proxy"
        } else {
            proxy = `${proxy.ip}:${proxy.port}:${proxy.user}:${proxy.password}`
        }
        const hook = new Webhook(webhook);

        const embed = new MessageBuilder()
            .setAuthor('OrionRaffle')
            .setDescription(`${link}`)
            .addField('Raffle type', 'Courir Instore', true)
            .addField('City', `${csv.name}`, true)
            .addField('Card', `||${csv.idCard}||`, true)
            .setColor(color)
            .setThumbnail('https://image.noelshack.com/fichiers/2021/15/4/1618483080-courir.jpg')
            .setFooter('OrionRaffle', "https://gblobscdn.gitbook.com/spaces%2F-MU-J_1ng5obqnzK3YrK%2Favatar-1614016542368.png?alt=media")
            .setTimestamp();

        try {
            hook.send(embed);
        } catch {

        }
    }

}

async function range(first, second) {
    let num = 0
    let max
    let min
    if (first > second) {
        max = first
        min = second
    } else {
        max = second
        min = first
    }

    num = parseInt(Math.random() * (max - min) + min);
    console.log(await date(), "[Info] Waiting for the next task during " + num + "s")

    await sleep(num * 1000)
}


function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}
async function pourcentage(i, length, version, success) {

    instance = process.cwd()
    instance = instance.split("\\").pop()


    var setTitle = require('node-bash-title');
    if (length == 0) {
        a = 0
    } else {
        a = i / length
    }

    setTitle(`OrionRaffle | Instance /${instance} | Private Beta | V.${version} | ${parseInt(a * 100)}% | Success : ${success} | Failed : ${i - success}`);
}


async function courirInstore(version) {


    clear()
    console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
    console.log(chalk.rgb(247, 158, 2)("\n Courir Instore"))
    data = await getSession(null, 'fr')
    html = data.data

    shopHtml = html.split("STORES = '")[1].split("'")[0]
    shop = extract(shopHtml)
    sneakerHtml = html.split("SIZES = '")[1].split("'")[0]
    sneaker = extract(sneakerHtml)
    // console.log(sneaker)
    nameHtml = (html.split('Choisissez votre modèle</option>')[1].split("</select>")[0]).trim()
    var raffle = []

    var root = HTMLParser.parse(html.split('Choisissez votre modèle</option>')[1].split("</select>")[0])
    // console.log(root)
    // console.log(root.childNodes[1].childNodes)
    // console.log("---------------------------------------")
    // console.log(root.childNodes[1].childNodes[0].parentNode.rawAttrs)
    // console.log("---------------------------------------")

    // console.log(root.childNodes[1].childNodes[0].rawText)




    for (let i = 1; i < root.childNodes.length; i = i + 2) {
        raffle.push({ "id": root.childNodes[i].childNodes[0].parentNode.rawAttrs.split('value="')[1].split('"')[0], "name": root.childNodes[i].childNodes[0].rawText, "sizes": [], "tabSize": [], "tabRangeId": [], "tabRangeName": [] })
    }

    for (let i = 0; i < raffle.length; i++) {
        for (let j = 0; j < sneaker[0][raffle[0].id].length; j++) {
            raffle[i].sizes.push({ 'id': sneaker[0][raffle[i].id][j].id, 'label': sneaker[0][raffle[i].id][j].label })
            // console.log(raffle[i].sizes[j])
        }

    }


    sneakersAvailable = raffle
    sneakersReserved = []

    clear()
    console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
    console.log(chalk.rgb(247, 158, 2)("\n Courir Instore | Raffle Mode"))
    console.log(" ----------------------------------------------------\n")



    input = "y"

    while (input == "y") {
        if (sneakersReserved != 0) {
            clear()
            console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
            console.log(chalk.rgb(247, 158, 2)("\n Courir Instore | Raffle Mode"))
            console.log("-----------------------------------------------------\n")

            console.log(chalk.rgb(247, 158, 2)(" Sneakers already added (" + sneakersReserved.length + "/3)\n"))
            for (i = 0; i < sneakersReserved.length; i++) {
                console.log(" [+] " + sneakersReserved[i].name + " |", chalk.rgb(247, 158, 2)(...sneakersReserved[i].tabRangeName))
            }

            console.log("\n ------------------------------------------\n")
        }

        console.log(chalk.rgb(247, 158, 2)(" Sneakers available\n"))
        for (i = 0; i < sneakersAvailable.length; i++) {
            console.log(" " + (i + 1) + ". " + sneakersAvailable[i].name)
        }
        console.log("\n")


        sneakersChoice = inputReader.readInteger()
        await sleep(100)
        while (true) {
            if ((sneakersChoice <= sneakersAvailable.length) && (sneakersChoice > 0)) {
                break
            }
            sneakersChoice = inputReader.readLine()
        }

        sneakersReserved.push(sneakersAvailable[sneakersChoice - 1])
        tabSize = []
        tabRangeId = []
        tabRangeName = []

        for (let i = 0; i < sneakersAvailable[sneakersChoice - 1].sizes.length; i++) {
            // console.log(sneakersAvailable[sneakersChoice - 1].sizes[i])
            tabSize.push(sneakersAvailable[sneakersChoice - 1].sizes[i].label)
        }

        sneakersReserved[sneakersReserved.length - 1].tabSize = tabSize
        // console.log(sneakersAvailable[sneakersChoice - 1])
        console.log(chalk.rgb(247, 158, 2)("Sizes available :", ...sneakersReserved[sneakersReserved.length - 1].tabSize))
        console.log('From size ?')
        FromSize = inputReader.readFloat()
        console.log('To size ?')
        ToSize = inputReader.readFloat()
        if (FromSize > ToSize) return

        for (let i = 0; i < sneakersReserved[sneakersReserved.length - 1].tabSize.length; i++) {
            if (sneakersReserved[sneakersReserved.length - 1].tabSize[i] >= FromSize && sneakersReserved[sneakersReserved.length - 1].tabSize[i] <= ToSize) {
                tabRangeId.push(sneakersAvailable[sneakersChoice - 1].sizes[i].id)
                tabRangeName.push(sneakersAvailable[sneakersChoice - 1].sizes[i].label)
            }
        }
        while (tabRangeId.length == 0) {
            console.log('From size ?')
            FromSize = inputReader.readFloat()
            console.log('To size ?')
            ToSize = inputReader.readFloat()
            if (FromSize > ToSize) return

            for (let i = 0; i < sneakersReserved[sneakersReserved.length - 1].tabSize.length; i++) {
                if (sneakersReserved[sneakersReserved.length - 1].tabSize[i] >= FromSize && sneakersReserved[sneakersReserved.length - 1].tabSize[i] <= ToSize) {
                    tabRangeId.push(sneakersAvailable[sneakersChoice - 1].sizes[i].id)
                    tabRangeName.push(sneakersAvailable[sneakersChoice - 1].sizes[i].label)
                }
            }
        }
        sneakersReserved[sneakersReserved.length - 1].tabRangeId = tabRangeId
        sneakersReserved[sneakersReserved.length - 1].tabRangeName = tabRangeName


        sneakersAvailable.splice(sneakersChoice - 1, 1)
        if (sneakersReserved.length < 3) {

            console.log('Would you like to add an another sneakers ? (y/n)')
            input = inputReader.readLine()
            switch (input) {
                case "y": break
                case "n": break
            }

        } else {
            input == "n"
            break

        }
    }
    clear()
    console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
    console.log(chalk.rgb(247, 158, 2)(`\n Courir Instore Mode | Raffle Mode`))
    console.log("-----------------------------------------------------\n")

    console.log('Range between each task ? (First number) (s)')
    first = inputReader.readInteger()
    console.log('Range between each task ? (Second number) (s)')
    second = inputReader.readInteger()
    console.log(`[Info] Range ${first} - ${second} seconds`)
    console.log('\n-----------------------------------------------------\n')

    clear()
    console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
    console.log(chalk.rgb(247, 158, 2)("\n Courir Instore | Raffle Mode"))
    console.log("------------------------------------------------------------\n")

    console.log(chalk.rgb(247, 158, 2)("Selected sneakers\n"))
    for (i = 0; i < sneakersReserved.length; i++) {
        console.log(" [+] " + sneakersReserved[i].name + " |", chalk.rgb(247, 158, 2)(...sneakersReserved[i].tabRangeName))
    }
    console.log("\n------------------------------------------------------------\n")

    console.log(`[Settings] Range : ${first} - ${second} seconds `)

    csvraffle = await csvrafflereaderCourirInstore()
    if (csvraffle.length == 0) {
        console.log(colors.brightRed('The file courirInstore/raffle.csv is empty'))
        await sleep(2000)
        return
    }
    csvproxy = await csvproxyreader()
    await sleep(500)
    if (csvproxy == 0) {
        console.log("\n[Info] Proxy required")
        await sleep(4000)
        return
    }


    console.log('\n[Info] Start tasks..')

    var proxyid = 0
    var success = 0
    await pourcentage(0, 0, version, 0)
    config = await csvconfigreader()
    await sleep(100)

    for (i in csvraffle) {

        console.log()
        size = []
        for (let i = 0; i < sneakersReserved.length; i++) {
            size.push(sneakersReserved[i].tabRangeId[Math.floor(Math.random() * sneakersReserved[i].tabRangeId.length)])
        }

        csvraffle[i].size = size
        if (csvraffle[i].length == 5) {
            console.log(colors.red(await date(), 'Fields are missing in the csv'))
            try {
                discord(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'failed')
            } catch (err) { }
        }
        if (csvraffle[i].Country != 'FR' && csvraffle[i].Country != 'BE') {
            console.log(colors.red(await date(), 'Problem with country'))
            try {
                discord(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'failed')
            } catch (err) { }
        } else {
            if (csvraffle[i].idShop == "32") {
                csvraffle[i].name = "BRUXELLES CITY 2"
                csvraffle[i].idShop = "2460"

            } else {

                for (let j = 0; j < shop[0].length; j++) {

                    if (csvraffle[i].idShop == String(j)) {
                        csvraffle[i].idShop = shop[0][String(j)].identifier
                        csvraffle[i].name = shop[0][String(j)].name

                    }
                }
            }
            // console.log(shop)

           
            // str = ""
            // for(i = 1874; i < 1947; i = i + 2){
            //     str = str + '"' + i + '",'
            // }
            // console.log(str)
            // await sleep(500000)
            if (csvraffle[i].name == "") {
                console.log(colors.red(await date(), 'id shop incorrect'))
                try {
                    discord(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'failed')
                } catch (err) { }
            } else {
                dateString = await date()
                console.log(dateString + "[Info][" + parseInt(i + 1) + "] City " + csvraffle[i].name)
                link = await courirInstoreMain(csvraffle[i], parseInt(i + 1), csvproxy[proxyid])
                while (link == -1) {
                    console.log('[Info] Rotating proxy')
                    proxyid++
                    if (csvproxy.length <= proxyid) {
                        console.log(colors.red(await date(), 'There is no more proxy available in proxy.txt'))
                        console.log('\nPlease reboot the bot')
                        await sleep(100000000)
                    }
                    link = await courirInstoreMain(csvraffle[i], parseInt(i + 1), csvproxy[proxyid])

                }
                if (link != 0) {
                    success++
                    await csvCourirInstoreLog(csvraffle[i])
                    csvraffle[i].link = link
                    dateString = await date()
                    console.log(colors.green(dateString + "[Info][" + Number(parseInt(i + 1)) + "][" + csvraffle[i].name + "] Successfully entered the raffle"))
                    try {
                        discord(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'success')
                    } catch (err) { }
                } else {
                    try {
                        discord(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'failed')
                    } catch (err) { }
                }
            }
        }
        if (csvproxy.length <= proxyid) {
            console.log(colors.red(await date(), 'There is no more proxy available in proxy.txt'))
            console.log('\nPlease reboot the bot')
            await sleep(100000000)
        }
        await pourcentage(parseInt(i) + 1, csvraffle.length, version, success)
        if (csvraffle.length != i + 1) {
            await range(first, second)
            proxyid++
        }
    }
    console.log('\nPlease reboot the bot')
    await sleep(100000000)

}

module.exports = {
    courirInstore
}