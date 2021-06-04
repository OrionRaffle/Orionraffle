const path = require('path');

const inputReader = require('wait-console-input');
const figlet = require("figlet")
const colors = require("colors")
const clear = require('console-clear');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const chalk = require('chalk');
const { csvregisterreaderCourir, csvloginreaderCourir, csvproxyreader, csvconfigreader, csvRegisterCourirLog, csvLoginCourirLog } = require('../../init')
const { loginfirst } = require('./login/loginfirst')
const { logintwo } = require('./login/logintwo')
const { registerfirst, getRaffleData } = require('./register/registerfirst')
const { registertwo, getIdRecaptcha, getTokenRecaptcha } = require('./register/registertwo');
const { getRaffleId } = require('./register/registerfirst');

const { menu, displayModule, logError, logInfo, logSuccess } = require(path.join(__dirname, '../../utils/console'))
const { csvReadProxy, csvReadClientAuth } = require(path.join(__dirname, '../../utils/csvReader'))
const { reinitProgram } = require(path.join(__dirname, '../../utils/utils'))
const { getRaffle } = require(path.join(__dirname, '../../utils/gateway/gatewayCourir'))
const { getRaffleDataCourirEql } = require(path.join(__dirname, '../../utils/gateway/gatewayEql'))

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

function discordRegister(csv, webhook, proxy, state) {

  if (state == "success") {
    color = '#18cc36'

  } else {
    color = '#EE2016'

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
      .setTitle('Account Register+ Raffle Mode')
      .addField('Raffle type', 'Courir', true)
      .addField('Size', `${csv.Size}`, true)
      .addField('Raffle', `${csv.NameRaffle}`, true)
      .addField('Email', `${csv.Email}`, true)
      .addField('Password', `||${csv.Password}||`, true)
      .addField('Address', `${csv.Address}`, true)
      .addField('CardNumber', `||${csv.CardNumber}||`, true)
      .addField('Proxy', `||${proxy}||`, true)
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
function discordLogin(csv, webhook, proxy, state) {

  if (state == "success") {
    color = '#18cc36'

  } else {
    color = '#EE2016'

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
      .setTitle('Account Login + Raffle Mode')
      .addField('Raffle type', 'Courir', true)
      .addField('Size', `${csv.Size}`, true)
      .addField('Raffle', `${csv.NameRaffle}`, true)
      .addField('Email', `${csv.Email}`, true)
      .addField('Password', `||${csv.Password}||`, true)
      .addField('Address', `${csv.Address}`, true)
      .addField('CardNumber', `||${csv.CardNumber}||`, true)
      .addField('Proxy', `||${proxy}||`, true)
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


async function courir(version, module) {
  let twoCaptchatKey;

  tabRange = []
  realTabRange = []
  var tabSizeEU = []
  var tabSize = []
  var raffleTab = []

  async function checkConfig(configuration) {
    twoCaptchatKey = configuration.Key2Captcha;

    if (twoCaptchatKey === "") await reinitProgram(`2Captcha Key required for ${module.label}`)
    else await csvReadProxy(handleProxy);
  }
  async function handleProxy(proxies) {
    if (proxies.length === 0) return reinitProgram(`Proxy required for ${module.label}`)
    await getRaffle(handleRaffle)
  }
  async function handleRaffle(raffles) {
    let rafflesData = [];
    raffles = [
      { 'Name': 'Test', 'id': 'nike-dunk-low-university-blue', 'link': 'https://eql.xyz/page-data/fr-FR/launch/courir/nike-dunk-low-university-blue/page-data.json' },
    ]
    if (raffles.length === 0) return await reinitProgram('No raffle available.');

    async function getRafflesData() {
      raffles.forEach(async (raffle) => {
        const json = await getRaffleDataCourirEql(raffle.id);
        if (json === undefined) {
          return reinitProgram(`Error with eql, raffle id: ${raffle.id}.`);
        }
        else {
          let sizes = [];
          json.inventory.forEach(size => {
            sizes.push(size.variant_title)
          })
          rafflesData.push(
            {
              "name": json.product,
              "price": json.price,
              "id": json.id,
              "sizeGlobal": tabSize,
              "sizeRun": ""
            });
            console.log('finish')
          return;
        }
      });
    }
    await getRafflesData();
    console.log(rafflesData);
  }


  displayModule(module.label);
  csvReadClientAuth(checkConfig)
  return;

  // raffle = [
  //   // { 'Name': 'Dunk Low SE Easter', 'id': 'CR0008', 'link': 'https://www.sneakql.com/page-data/fr-FR/launch/courir/nike-dunk-low-se-easter/page-data.json' },
  //   { 'Name': 'Dunk Low Free 99', 'id': 'CR0004', 'link': 'https://www.sneakql.com/page-data/fr-FR/launch/courir/nike-dunk-low-free-ninetynine/page-data.json' }
  // ]


  for (let i = 0; i < idCourir.length; i++) {
    json = await getRaffleData(idCourir[i].idRaffle)
    let tabSize = []
    for (let j = 0; j < json.inventory.length; j++) {
      tabSize.push(json.inventory[j].variant_title)
    }
    raffleTab.push({ "name": json.product, "price": json.price, "id": json.id, "sizeGlobal": tabSize, "sizeRun": "" })
  }

  await sleep(100)
  for (let i = 0; i < raffleTab.length; i++) {
    // console.log(raffleTab[i].name)
    console.log(`${i + 1}. ${raffleTab[i].name} / ${raffleTab[i].price}€`)
  }
  console.log("-----------------------------------------------------\n")

  var input = inputReader.readInteger()
  while (true) {
    if (input <= raffleTab.length && input > 0) {
      break
    }
    input = inputReader.readInteger()
  }

  raffle = raffleTab[input - 1]

  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
  console.log(chalk.rgb(247, 158, 2)(`\n Courir Online Mode | ${raffle.name}`))
  console.log("-----------------------------------------------------\n")


  for (let i = 0; i < raffle.sizeGlobal.length; i++) {
    tabSize.push(raffle.sizeGlobal[i].split("EU ")[1])
  }
  console.log('Size Available :', chalk.rgb(247, 158, 2)(...tabSize))
  console.log('\nFrom size ?')
  FromSize = inputReader.readFloat()
  console.log('\nTo size ?')
  ToSize = inputReader.readFloat()
  if (FromSize > ToSize) return

  tabRangeSansEu = []
  tabRange = []
  for (let i = 0; i < tabSize.length; i++) {

    if (tabSize[i] >= FromSize && tabSize[i] <= ToSize) {
      tabRange.push(raffle.sizeGlobal[i])
      tabRangeSansEu.push(tabSize[i])
    }
  }
  if (tabRange == '') {
    console.log(`[Error] Wrong size`)
    await sleep(5000)
    return
  }
  raffle.sizeRun = tabRange

  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
  console.log(chalk.rgb(247, 158, 2)(`\n Courir Online Mode | ${raffle.name}`))
  console.log("-----------------------------------------------------\n")

  console.log('Range between each task ? (First number) (s)')
  first = inputReader.readInteger()
  console.log('Range between each task ? (Second number) (s)')
  second = inputReader.readInteger()

  // console.log('\n-----------------------------------------------------\n')
  // console.log('Sound Effect (y/n) ?')
  // sound = inputReader.readLine()
  // while (true) {
  //   if (sound == 'y' || sound == 'n') {
  //     break
  //   }
  //   sound = inputReader.readLine()
  // }

  // if(sound == 'y'){
  //   sound = true
  // }else{
  //   sound = false
  // }



  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
  console.log(chalk.rgb(247, 158, 2)(`\n Courir Online Mode | ${raffle.name}`))
  console.log("-----------------------------------------------------\n")

  console.log("1. Account Register + Raffle Mode")
  console.log("2. Account Login + Raffle Mode")

  console.log('\n-------------------------------------------\n')

  var input = inputReader.readInteger()

  switch (input) {

    case 1:

      clear()
      console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
      console.log(chalk.rgb(247, 158, 2)(`\n Courir Online Mode | Account Register + Raffle Mode | ${raffle.name}`))
      console.log("----------------------------------------------------------------------\n")
      console.log(`[Settings] Size :`, chalk.rgb(247, 158, 2)(...tabRangeSansEu), `| Range : ${first} - ${second} seconds `)

      csvraffle = await csvregisterreaderCourir()
      if (csvraffle.length == 0) {
        console.log(colors.brightRed('The file courir/register.csv is empty'))
        await sleep(2000)
        return
      }

      console.log('\n[Info] Start tasks..')

      var proxyid = 0
      var success = 0


      await pourcentage(0, 0, version, 0)

      var revo = { "revoTask": "", "revoDelay": "" }
      for (let i = 0; i < csvraffle.length; i++) {


        size = raffle.sizeRun[Math.floor(Math.random() * raffle.sizeRun.length)]
        csvraffle[i].Size = size
        csvraffle[i].IdRaffle = raffle.id
        csvraffle[i].NameRaffle = raffle.name
        csvraffle[i].revo = revo

        if ((csvraffle[i].Email == "") || (csvraffle[i].Password == "") || (csvraffle[i].FirstName == "") || (csvraffle[i].LastName == "") || (csvraffle[i].Country == "") || (csvraffle[i].Address == "") || (csvraffle[i].PostalCode == "") || (csvraffle[i].City == "") || (csvraffle[i].State == "") || (csvraffle[i].CardNumber == "") || (csvraffle[i].MM == "") || (csvraffle[i].YY == "") || (csvraffle[i].CVC = "")) {
          console.log(colors.red(await date(), 'Problem with a csv field'))
        } else {
          info = await registerfirst(csvraffle[i], csvproxy[proxyid], parseInt((i) + 1))
          while (info == -1) {
            console.log('[Info] Rotating proxy')
            proxyid++
            if (csvproxy.length <= proxyid) {
              console.log(colors.red(await date(), 'There is no more proxy available in proxy.txt'))
              console.log('\nPlease reboot the bot')
              await sleep(100000000)
            }
            info = await registerfirst(csvraffle[i], csvproxy[proxyid], parseInt((i) + 1))
          }
          if (info == 0) {
            try {
              discordRegister(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'failed')
            } catch (err) { }
          } else {

            if (info.revo.revoTask != "") {
              revo.revoTask = info.revo.revoTask
              revo.revoDelay = info.revo.revoDelay
            }
          }
          console.log(`[Info][${Number(parseInt(i) + 1)}][${csvraffle[i].Email}] Solving Captcha..`)
          idCaptcha = await getIdRecaptcha(config[0].Key2Captcha, csvproxy[proxyid])
          if (idCaptcha == -1) {
            try {
              discordRegister(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'failed')
            } catch (err) { }
            console.log('\nPlease reboot the bot')
            await sleep(100000000)
          } else {
            while (idCaptcha == 1 || idCaptcha == 0) {
              proxyid++
              idCaptcha = await getIdRecaptcha(config[0].Key2Captcha, csvproxy[proxyid])
              if (idCaptcha == -1) {
                try {
                  discordRegister(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'failed')
                } catch (err) { }
                console.log('\nPlease reboot the bot')
                await sleep(100000000)
              }
            }

            await sleep(10000)
            responseCaptcha = 1
            while (responseCaptcha == 1 || responseCaptcha == 0) {
              await sleep(2000)
              responseCaptcha = await getTokenRecaptcha(config[0].Key2Captcha, csvproxy[proxyid], idCaptcha)
              if (responseCaptcha == 0) {
                proxyid++
              }
            }
            console.log(colors.green("[Info][" + parseInt((i) + 1) + "][" + csvraffle[i].Email + "] Captcha success"))

            error = await registertwo(info, parseInt((i) + 1), csvproxy[proxyid], responseCaptcha)
            while (error == -1) {
              proxyid++
              // if (csvproxy.length <= proxyid) {
              //   console.log(colors.red(await date(), 'There is no more proxy available in proxy.txt'))
              //   console.log('\nPlease reboot the bot')
              //   await sleep(100000000)
              // }
              error = await registertwo(info, parseInt((i) + 1), csvproxy[proxyid], responseCaptcha)
            }
            if (error != 0) {
              success++
              await csvRegisterCourirLog(csvraffle[i])
              try {
                discordRegister(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'success')
              } catch (err) { }

            } else {
              try {
                discordRegister(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'failed')
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

      break

    case 2:
      clear()
      console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted' })));
      console.log(chalk.rgb(247, 158, 2)(`\n Courir Online Mode | Account Login + Raffle Mode | ${raffle.name}`))
      console.log("----------------------------------------------------------------------\n")
      console.log(`[Settings] Size :`, chalk.rgb(247, 158, 2)(...tabRangeSansEu), `| Range : ${first} - ${second} seconds `)

      csvraffle = await csvloginreaderCourir()
      if (csvraffle.length == 0) {
        console.log(colors.brightRed('The file courir/login.csv is empty'))
        await sleep(2000)
        return
      }

      console.log('\n[Info] Start tasks..')

      var proxyid = 0
      var success = 0

      await pourcentage(0, 0, version, 0)

      var revo = { "revoTask": "", "revoDelay": "" }

      for (let i = 0; i < csvraffle.length; i++) {

        size = raffle.sizeRun[Math.floor(Math.random() * raffle.sizeRun.length)]
        csvraffle[i].Size = size
        csvraffle[i].IdRaffle = raffle.id
        csvraffle[i].NameRaffle = raffle.name
        csvraffle[i].revo = revo

        if ((csvraffle[i].Email == "") || (csvraffle[i].Password == "") || (csvraffle[i].FirstName == "") || (csvraffle[i].LastName == "") || (csvraffle[i].Country == "") || (csvraffle[i].Address == "") || (csvraffle[i].PostalCode == "") || (csvraffle[i].City == "") || (csvraffle[i].State == "") || (csvraffle[i].CardNumber == "") || (csvraffle[i].MM == "") || (csvraffle[i].YY == "") || (csvraffle[i].CVC = "")) {
          console.log(colors.red(await date(), 'Problem with a csv field'))
        } else {
          info = await loginfirst(csvraffle[i], parseInt((i) + 1), csvproxy[proxyid])
          while (info == -1) {
            console.log('[Info] Rotating proxy')
            proxyid++
            // if (csvproxy.length <= proxyid) {
            //   console.log(colors.red(await date(), 'There is no more proxy available in proxy.txt'))
            //   console.log('\nPlease reboot the bot')
            //   await sleep(100000000)
            // }
            info = await loginfirst(csvraffle[i], parseInt((i) + 1), csvproxy[proxyid])
          }
          if (info == 0) {
            try {
              discordLogin(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'failed')
            } catch (err) { }
          } else {
            if (info.revo.revoTask != "") {
              revo.revoTask = info.revo.revoTask
              revo.revoDelay = info.revo.revoDelay
            }
            console.log(`[Info][${Number(parseInt(i) + 1)}][${csvraffle[i].Email}] Solving Captcha..`)
            idCaptcha = await getIdRecaptcha(config[0].Key2Captcha, csvproxy[proxyid])
            if (idCaptcha == -1) {
              try {
                discordLogin(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'failed')
              } catch (err) { }
              console.log('\nPlease reboot the bot')
              await sleep(100000000)
            } else {
              while (idCaptcha == 1 || idCaptcha == 0) {
                proxyid++
                idCaptcha = await getIdRecaptcha(config[0].Key2Captcha, csvproxy[proxyid])
                if (idCaptcha == -1) {
                  try {
                    discordLogin(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'failed')
                  } catch (err) { }
                  console.log('\nPlease reboot the bot')
                  await sleep(100000000)
                }
              }

              await sleep(10000)
              responseCaptcha = 1
              while (responseCaptcha == 1 || responseCaptcha == 0) {
                await sleep(2000)
                responseCaptcha = await getTokenRecaptcha(config[0].Key2Captcha, csvproxy[proxyid], idCaptcha)
                if (responseCaptcha == 0) {
                  proxyid++
                }
              }
              console.log(colors.green("[Info][" + parseInt((i) + 1) + "][" + info.Email + "] Captcha success"))

              error = await logintwo(info, csvproxy[proxyid], responseCaptcha)
              while (error == -1) {
                proxyid++
                if (csvproxy.length <= proxyid) {
                  console.log(colors.red(await date(), 'There is no more proxy available in proxy.txt'))
                  console.log('\nPlease reboot the bot')
                  await sleep(100000000)
                }
                error = await logintwo(info, csvproxy[proxyid], responseCaptcha)
              }
              if (error != 0) {
                console.log(colors.green("[Info][" + parseInt((i) + 1) + "][" + info.Email + "] Successfully entered the raffle"))
                success++
                await csvLoginCourirLog(csvraffle[i])
                try {
                  discordLogin(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'success')
                } catch (err) { }

              } else {
                try {
                  discordLogin(csvraffle[i], config[0].webhook, csvproxy[proxyid], 'failed')
                } catch (err) { }
              }

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
      break


  }

  console.log('\nPlease reboot the bot')
  await sleep(100000000)





}

module.exports = {
  courir,

}