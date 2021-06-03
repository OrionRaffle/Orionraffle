const inputReader = require('wait-console-input')
const figlet = require('figlet')
const colors = require('colors')
const clear = require('console-clear')
const setTitle = require('node-bash-title')
const chalk = require('chalk')
const { Webhook, MessageBuilder } = require('discord-webhook-node')
const { csvconfigreaderShuzu, csvproxyreader, csvconfigreader } = require('../../init')
const { getTypeformData, getRaffleId, getSignature, finishTypeform } = require('./shuzuFunction')

function pad(num) {
  return `0${num}`.slice(-2)
}
async function date() {
  const date_ob = new Date()
  const seconds = date_ob.getSeconds()
  const minutes = date_ob.getMinutes()
  const hour = date_ob.getHours()

  // prints date & time in YYYY-MM-DD format
  return `[${pad(hour)}:${pad(minutes)}:${pad(seconds)}]`
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

  num = parseInt(Math.random() * (max - min) + min)
  console.log(await date(), `[Info] Waiting for the next task during ${num}s`)

  await sleep(num * 1000)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function pourcentage(i, length, version, success) {
  instance = process.cwd()
  instance = instance.split('\\').pop()

  if (length === 0) {
    a = 0
  } else {
    a = (i + 1) / length
  }

  setTitle(
    `OrionRaffle | Instance /${instance} | Private Beta | V.${version} | ${parseInt(
      a * 100
    )}% | Success : ${success} | Failed : ${i - success}`
  )
}

function discordRaffle(csv, webhook, proxy, size, titleRaffle, state, country) {

  if (state == 'success') {
    color = '#18cc36'
  } else {
    color = '#EE2016'
  }

  if (webhook != '') {
    if (webhook !== undefined) {
      if (proxy.ip === undefined) {
        proxy = 'No proxy'
      } else {
        proxy = `${proxy.ip}:${proxy.port}:${proxy.user}:${proxy.password}`
      }
      const hook = new Webhook(webhook)

      const embed = new MessageBuilder()
        .setAuthor('OrionRaffle')
        .setTitle('Raffle Mode')
        .addField('Raffle Type', 'ShuzuLab', true)
        .addField('Email', `${csv.Email}`, true)
        .addField('Raffle', `${titleRaffle}`, true)
        .addField('Country', `${country}`, true)
        .addField('Size', `${size}`, true)
        .addField('Proxy', `||${proxy}||`, true)
        .setColor(color)
        .setFooter(
          'OrionRaffle',
          'https://gblobscdn.gitbook.com/spaces%2F-MU-J_1ng5obqnzK3YrK%2Favatar-1614016542368.png?alt=media'
        )
        .setTimestamp()
      try {
        hook.send(embed)
      } catch { }
    }
  }
}
async function shuzuRaffle(version) {


  var form = []
  var raffleData = []
  var tabSizes = []
  idShuzu = await getRaffleId()
  config = await csvconfigreader()
  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted', })))
  console.log(chalk.rgb(247, 158, 2)('\n ShuzuLab | Raffle mode'))
  console.log('-----------------------------------------------------\n')
  await sleep(500)
  if (idShuzu.length == 0) {
    console.log('\n[Info] No raffle at this moment\n')
    await sleep(2000)
    return
  }

  for (i = 0; i < idShuzu.length; i++) {
    data = await getTypeformData(idShuzu[i].idRaffle)
    raffleData.push(data)
  }



  for (i = 0; i < idShuzu.length; i++) {
    console.log(` ${i + 1}. ${raffleData[i].title}`)
  }
  console.log('\n-----------------------------------------------------\n')


  input = inputReader.readInteger()

  await sleep(100)
  while (true) {
    if (input <= idShuzu.length && input > 0) {
      break
    }
    input = inputReader.readInteger()
  }

  idRaffle = raffleData[input - 1].id

  // Find size 
  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted', })))
  console.log(chalk.rgb(247, 158, 2)('\n ShuzuLab | Raffle mode | ' + raffleData[input - 1].title))
  console.log('-----------------------------------------------------\n')

  globalSize = []
  tabRange = []
  for (i = 0; i < raffleData[input - 1].fields[3].properties.choices.length; i++) {
    globalSize.push(Number(raffleData[input - 1].fields[3].properties.choices[i].label.split('- ')[1].split(' US')[0]))
  }

  console.log("Size availables : ", ...globalSize)

  console.log('\nFrom Size ?')
  FromSize = inputReader.readFloat()
  console.log('To Size')
  ToSize = inputReader.readFloat()

  if (FromSize > ToSize) return

  for (j = 0; j < globalSize.length; j++) {
    if (globalSize[j] >= FromSize && globalSize[j] <= ToSize) {
      tabRange.push(globalSize[j])
    }
  }


  if (tabRange == '') {
    console.log(`[Error] Wrong size`)
    await sleep(5000)
    return
  }
  console.log(`\n[Info] Size range :`, ...tabRange)



  for (i = 0; i < raffleData[input - 1].fields[3].properties.choices.length; i++) {
    for (j = 0; j < tabRange.length; j++) {
      if (raffleData[input - 1].fields[3].properties.choices[i].label.includes(tabRange[j]))
        tabSizes.push({ "id": raffleData[input - 1].fields[3].properties.choices[i].id, "label": raffleData[input - 1].fields[3].properties.choices[i].label })
    }
  }
  await sleep(100)
  const seen = new Set();
  tabSizes = tabSizes.filter(el => {
    const duplicate = seen.has(el.id);
    seen.add(el.id);
    return !duplicate;
  });



  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted', })))
  console.log(chalk.rgb(247, 158, 2)('\n ShuzuLab | Raffle mode | ' + raffleData[input - 1].title))
  console.log('-----------------------------------------------------\n')


  for (i = 0; i < raffleData[input - 1].fields[4].properties.choices.length; i++) {
    console.log(` ${i + 1}. ${raffleData[input - 1].fields[4].properties.choices[i].label}`)
  }
  console.log('\n-----------------------------------------------------\n')

  inputCountry = inputReader.readInteger()

  await sleep(100)
  while (true) {
    if (inputCountry <= raffleData[input - 1].fields[4].properties.choices.length && inputCountry > 0) {
      break
    }
    inputCountry = inputReader.readInteger()
  }

  labelCountry = raffleData[input - 1].fields[4].properties.choices[inputCountry - 1].label
  idShip = raffleData[input - 1].fields[5].properties.choices[0].id


  form = {
    "name": { "id": raffleData[input - 1].fields[1].id, "name": "" },
    "email": { "id": raffleData[input - 1].fields[2].id, "email": "" },
    "size": { "id": raffleData[input - 1].fields[3].id, "size": {} },
    "country": { "id": raffleData[input - 1].fields[4].id, "country": labelCountry },
    "shipping": { "id": raffleData[input - 1].fields[5].id, "ship": idShip },
  }
 

  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted', })))
  console.log(chalk.rgb(247, 158, 2)('\n ShuzuLab | Raffle mode | ' + raffleData[input - 1].title))
  console.log('-----------------------------------------------------\n')
  csv = await csvconfigreaderShuzu()
  await sleep(500)
  if (csv.length == 0) {
    console.log(colors.brightRed('The file raffle.csv is empty'))
    console.log('\nPlease reboot the bot')
    await sleep(100000000)
  }
  console.log('[Info] Use proxy ? (yes/no)')
  var repproxy = inputReader.readLine()

  if (repproxy == 'yes') {
    console.log('[Info] Proxy mode')
    var csvproxy = await csvproxyreader()
  } else {
    var csvproxy = new Array(csv.length)
    console.log('[Info] Proxyless mode')
  }

  if (csv.length > csvproxy.length) {
    console.log(colors.brightRed(`[Error] There are not enough proxies for the number of tasks, Proxy : ${csvproxy.length} / Tasks : ${csv.length}`))
    console.log('\nPlease reboot the bot')
    await sleep(100000000)
  }
  console.log('[Info] Range between each task ? (First number) (s)')
  first = inputReader.readInteger()
  console.log('[Info] Range between each task ? (Second number) (s)')
  second = inputReader.readInteger()
  console.log(`[Info] Range ${first} - ${second}`)

  clear()
  console.log(chalk.rgb(247, 158, 2)(figlet.textSync(' Orion', { font: 'Larry 3D', horizontalLayout: 'fitted', })))
  console.log(chalk.rgb(247, 158, 2)('\n ShuzuLab | Raffle mode | ' + raffleData[input - 1].title))
  console.log('-----------------------------------------------------\n')
  console.log(chalk.rgb(247, 158, 2)(`[Settings] Range ${first} - ${second} seconds | Size range :`, ...tabRange, `| Country : ` + labelCountry))

  var proxyid = 0
  var success = 0


  console.log("\n[Info] Start tasks..\n")
  await pourcentage(0, 0, version, 0)

  for (i in csv) {

    r = Math.floor(Math.random() * tabSizes.length)

    form.size.size = { "id": tabSizes[r].id, "label": tabSizes[r].label }
    form.name.name = csv[i].FirstName.trim()
    form.email.email = csv[i].Email.trim()


    if (repproxy != 'yes') {
      csvproxy[proxyid] = 0
    }

    numero = Number(parseInt(i) + 1)

    data = await getSignature(idRaffle, csvproxy[proxyid])
    while (data == -1) {
      proxyid++
      if ((proxyid + 1) > csvproxy.length) {
        console.log(colors.brightRed(await date(), "[Error] All proxies are used"))
        console.log('\nPlease reboot the bot')
        await sleep(100000000)
      }
      console.log(colors.brightRed(await date(), "[Error][" + numero + "][" + csv[i].Email + "] Switch proxy"))
      data = await getSignature(idRaffle, csvproxy[proxyid])
    }
    signature = data.signature
    startAt = data.submission.landed_at
    await sleep(5000)

    error = await finishTypeform(idRaffle, signature, form, startAt, csvproxy[proxyid])
    while (error == -1) {
      proxyid++
      if ((proxyid + 1) == csvproxy.length) {
        console.log(colors.brightRed(await date(), "[Error] All proxies are used"))
        console.log('\nPlease reboot the bot')
        await sleep(100000000)
      }
      console.log(colors.brightRed(await date(), "[Error][" + numero + "][" + csv[i].Email + "] Switch proxy"))
      error = await finishTypeform(idRaffle, signature, form, startAt, csvproxy[proxyid])
    }
    console.log(colors.green(await date(), `[${numero}][${csv[i].Email}] Successfully entered the raffle`))
    success++
    try {
      discordRaffle(csv[i], config[0].webhook, csvproxy[proxyid], form.size.size.label, raffleData[input - 1].title, 'success', form.country.country)
    } catch (err) { }


    await pourcentage(parseInt(i) + 1, csv.length, version, success)
    if((proxyid + 1) > csvproxy.length){
      console.log(colors.brightRed(await date(), "[Error] All proxies are used"))
      console.log('\nPlease reboot the bot')
      await sleep(100000000)
    }
    if (csv.length != parseInt(i) + 1) {
      await range(first, second)
      proxyid++
    }
  }

  console.log(colors.green(await date(), 'All tasks are completed'))
  console.log('\nPlease reboot the bot')
  await sleep(100000000)
}

module.exports = {
  shuzuRaffle,
}
