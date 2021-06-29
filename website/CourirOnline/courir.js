const path = require('path');

const inputReader = require('wait-console-input');
const figlet = require("figlet")
const colors = require("colors")
const clear = require('console-clear');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const chalk = require('chalk');
const {
  csvregisterreaderCourir,
  csvloginreaderCourir,
  csvproxyreader,
  csvconfigreader,
  csvRegisterCourirLog,
  csvLoginCourirLog
} = require('../../init')
const { loginfirst } = require('./login/loginfirst')
const { logintwo } = require('./login/logintwo')
const { registerfirst, getRaffleData } = require('./register/registerfirst')
const { registertwo, getIdRecaptcha, getTokenRecaptcha } = require('./register/registertwo');
const { getRaffleId } = require('./register/registerfirst');

const {
  register
} = require(path.join(__dirname, 'courirApi'));

const {
  menu,
  displayModule,
  displayCourirRaffle,
  displaySizeChoice,
  displayCourirMode,
  displayProxyTimeChoice,
  displayRecap,
  percent,
  logError,
  logInfo,
  logSuccess
} = require(path.join(__dirname, '../../utils/console'))
const { csvReadProxy, csvReadClientAuth, csvRegisterCourir } = require(path.join(__dirname, '../../utils/csvReader'))
const { reinitProgram } = require(path.join(__dirname, '../../utils/utils'))
const { validationCourirRegister } = require(path.join(__dirname, '../../utils/validation'))
const { getRaffle } = require(path.join(__dirname, '../../utils/gateway/gatewayCourir'))
const { getRaffleDataCourirEql } = require(path.join(__dirname, '../../utils/gateway/gatewayEql'))
const { sleep } = require(path.join(__dirname, '../../utils/utils'))

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

async function courir(version, module) {
  let twoCaptchatKey;

  tabRange = []
  realTabRange = []
  var tabSizeEU = []
  var tabSize = []
  var raffleTab = []

  var rafflesData = [];
  var proxiesTab = [];
  var usedProxiesTab = [];

  async function checkConfig(configuration) {
    twoCaptchatKey = configuration.Key2Captcha;

    if (twoCaptchatKey === "") await reinitProgram(`2Captcha Key required for ${module.label}`)
    else await csvReadProxy(handleProxy);
  }
  async function handleProxy(proxies) {
    if (proxies.length === 0) return reinitProgram(`Proxy required for ${module.label}`);
    proxiesTab = proxies;
    await getRaffle(handleRaffle);
  }
  async function handleRaffle(raffles) {
    if (raffles.length === 0) return await reinitProgram('No raffle available.');

    async function getRafflesData() {
      for (let index = 0; index < raffles.length; index++) {
        const json = await getRaffleDataCourirEql(raffles[index].id);
        if (json === undefined) {
          return reinitProgram(`Error with eql, raffle id: ${raffles[index].id}.`);
        }
        else {
          let sizes = [];
          json.inventory.forEach(size => {
            sizes.push(size.variant_title.split("EU ")[1])
          })
          rafflesData.push(
            {
              "name": json.product,
              "price": json.price,
              "id": json.id,
              "sizeGlobal": sizes,
              "sizeRun": ""
            });
        }
      }
    }
    await getRafflesData();
    await sleep(10000)

    await displayMenu(rafflesData);
  }
  async function displayMenu(rafflesData) {
    await sleep(200)
    console.log('hereA')

    choice = await displayCourirRaffle(rafflesData);
    choice = parseInt(choice);
    if (isNaN(choice)) logError('Wrong input.');
    else {
      choice--;
      if (rafflesData[choice] === undefined) logError('Invalid index.');
      else {
        console.log('getSize')
        await getSizes(rafflesData[choice]); 
        return;};
    }
    await sleep(1500);
    displayModule(module.label);
    await displayMenu(rafflesData);
  }
  async function getSizes(raffle) {
    await sleep(200)
    console.log('hereB')
    displayModule(module.label, raffle);
    const result = await displaySizeChoice(raffle.sizeGlobal);
    if (result.from <= result.to) {
      var tabSize = [];
      raffle.sizeGlobal.forEach(element => {
        element = parseFloat(element);
        if (element < result.from) { }
        else if (element > result.to) { }
        else tabSize.push(element);
      })
      await getProxyTimes(raffle, tabSize);
      return;
    }
    logError('Invalid inputs.')
    await sleep(1500);
    displayModule(module.label);
    await getSizes(raffle);
  }
  async function getProxyTimes(raffle, tabSize) {
    const result = await displayProxyTimeChoice()
    if (result.from <= result.to && result.from >= 0) return await chooseMode(raffle, tabSize, result.from, result.to);
    logError('Invalid inputs.')
    await sleep(1500);
    displayModule(module.label);
    await getProxyTimes(from, to);
  }
  async function chooseMode(raffle, tabSize, timeFrom, timeTo) {
    const choice = await displayCourirMode();

    async function now() {
      switch (choice) {
        case 1:
          await sleep(100)
      console.log('here2Z')
        process.exit(1)
          console.log(choice)
          await accountRegister(raffle, tabSize, timeFrom, timeTo);
          console.log('exit')
          process.exit(1)
          return;
        case 2:
          console.log(choice)
          return await accountLogin(raffle, tabSize, timeFrom, timeTo);
        default:
          break;
      }
    }
    await sleep(100)
    console.log('here2Z')
      process.exit(1)
    await now();
    logError('Invalid inputs.')
    await sleep(1500);
    displayModule(module.label);
    chooseMode(sizeFrom, sizeTo, timeFrom, timeTo);
  }
  async function accountRegister(raffle, tabSize, timeFrom, timeTo) {
    const mode = 'Account Register + Raffle Mode';
    displayRecap(module.label, mode, raffle.name, tabSize, timeFrom, timeTo);
    
    await sleep(100)

    await csvRegisterCourir(raffle, tabSize, timeFrom, timeTo, handleAccountRegister);
    console.log('here');
    process.exit(1)
  }

  async function handleAccountRegister(raffle, tabSize, timeFrom, timeTo, accounts) {
    console.log('281')
    if (accounts.length === 0) return logError('The file courir/register.csv is empty.');
    else {
      var proxyIndex = 0;
      const accountNumber = accounts.length;
      var attemptCount = 0;
      var successCount = 0;

      logInfo('Start tasks.', true);
      for (let i = 0; i < accountNumber; i++) {
        await percent(attemptCount, accountNumber, successCount);
        attemptCount++;
        accounts[i].Size = tabSize[Math.floor(Math.random() * tabSize.length)];
        accounts[i].IdRaffle = raffle.id;
        accounts[i].NameRaffle = raffle.name;
        if (!validationCourirRegister(accounts[i])) return logError(`Problem with a csv field on email ${accounts[i].Email}.`, true);

        const info = await register(accounts[i], getAnotherProxy(), attemptCount, getAnotherProxy);
        logInfo('Checking for another task.', true);
      };
      logSuccess('Tasks ended, thank you :)', true);
      await sleep(2000);
    }
  }
  function getAnotherProxy() {
    if (proxiesTab.length === 0) throw 'No more proxies';
    usedProxiesTab.push(proxiesTab[0]);
    const proxy = proxiesTab.shift();
    return {
      host: proxy.ip,
      port: proxy.port,
      auth: {
        username: proxy.user,
        password: proxy.password
      }
    };
  }
  async function accountLogin(sizeFrom, sizeTo, timeFrom, timeTo) {
    const mode = 'Account Login + Raffle Mode';
    displayRecap(module.label, mode, raffle.name, tabSize, timeFrom, timeTo);
    console.log('a l')
  }

  displayModule(module.label);
  await csvReadClientAuth(checkConfig);
  /*
  proxiesTab = [
    {
      ip: 'residential.bypassproxies.io',
      port: '7777',
      user: 'customer-tt_bp_bm_4058-cc-FR-sessid-gk4CxeklR',
      password: 'Bp1ksrvj6g'
    },
    {
      ip: 'residential.bypassproxies.io',
      port: '7777',
      user: 'customer-tt_bp_bm_4058-cc-FR-sessid-swmCkwLs5',
      password: 'Bp1ksrvj6g'
    },
    {
      ip: 'residential.bypassproxies.io',
      port: '7777',
      user: 'customer-tt_bp_bm_4058-cc-FR-sessid-e1Vtbt2wg',
      password: 'Bp1ksrvj6g'
    },
  ];
  accountRegister(
    {
      name: 'Dunk Low SE Free 99',
      price: 110,
      id: 'CR0017',
      sizeGlobal: [
        '40', '41',
        '42', '43',
        '44', '45',
        '46'
      ],
      sizeRun: ''
    },
    [40, 41],
    10,
    12
  )
  */
  return;

  // raffle = [
  //   // { 'Name': 'Dunk Low SE Easter', 'id': 'CR0008', 'link': 'https://www.sneakql.com/page-data/fr-FR/launch/courir/nike-dunk-low-se-easter/page-data.json' },
  //   { 'Name': 'Dunk Low Free 99', 'id': 'CR0004', 'link': 'https://www.sneakql.com/page-data/fr-FR/launch/courir/nike-dunk-low-free-ninetynine/page-data.json' }
  // ]


  switch (input) {
    case 1:
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

async function syncCourir(version, module) {
  console.log('lunch')
  await courir(version, module)
  console.log('end')
}

module.exports = {
  courir,
  syncCourir
}