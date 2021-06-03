const inputReader = require('wait-console-input')
const figlet = require('figlet')
const colors = require('colors')
const clear = require('console-clear')
const chalk = require('chalk')
const { Webhook, MessageBuilder } = require('discord-webhook-node')
const { genAccountFunction, register } = require('./shuzuFunction')
const { csvproxyreader, csvconfigreaderShuzu, csvconfigreader } = require('../../init')


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

  var setTitle = require('node-bash-title')
  if (length == 0) {
    a = 0
  } else {
    a = i / length
  }


  setTitle(
    `OrionRaffle | Instance /${instance} | Private Beta | V.${version} | ${parseInt(
      a * 100
    )}% | Success : ${success} | Failed : ${i - success}`
  )
}

async function date() {
  const date_ob = new Date()
  var seconds = date_ob.getSeconds()
  var minutes = date_ob.getMinutes()
  var hour = date_ob.getHours()

  // prints date & time in YYYY-MM-DD format
  return `[${pad(hour)}:${pad(minutes)}:${pad(seconds)}]`
}

function pad(num) {
  return `0${num}`.slice(-2)
}
function discordRaffle(csv, webhook, proxy, state) {

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
        .setTitle('Account generator')
        .addField('Raffle Type', 'ShuzuLab', true)
        .addField('Email', `${csv.Email}`, true)
        .addField('Password', `${csv.Password}`, true)
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
async function genAccount(version) {
  clear()
  console.log(
    chalk.rgb(
      247,
      158,
      2
    )(
      figlet.textSync(' Orion', {
        font: 'Larry 3D',
        horizontalLayout: 'fitted',
      })
    )
  )
  console.log(chalk.rgb(247, 158, 2)('\n ShuzuLab | Account generator'))
  console.log('-----------------------------------------------------\n')

  csv = await csvconfigreaderShuzu()
  config = await csvconfigreader()
  proxyid = 0
  success = 0

  await sleep(500)
  if (!csv.length == 0) {
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
      console.log(
        colors.brightRed(
          `[Error] There are not enough proxies for the number of tasks, Proxy : ${csvproxy.length} / Tasks : ${csv.length}`
        )
      )
    } else {
      console.log('\n[Info] Range between each task ? (First number) (s)')
      first = inputReader.readInteger()
      console.log('[Info] Range between each task ? (Second number) (s)')
      second = inputReader.readInteger()
      console.log(`[Info] Range ${first} - ${second}`)
      await sleep(500)

      console.log('[Info] Start tasks..')

      var success = 0
      var proxyid = 0
      await pourcentage(0, 0, version, 0)
      for (i in csv) {
        if (repproxy != 'yes') {
          csvproxy[proxyid] = 0
        }

        duplicity = await register(csv[i], csvproxy[proxyid])

        while (duplicity == -1) {
          proxyid++
          if ((proxyid + 1) > csvproxy.length) {
            console.log(colors.brightRed(await date(), "[Error][" + csv[i].Email + "] All proxies are used"))
            console.log('\nPlease reboot the bot')
            await sleep(100000000)
          }
          console.log(colors.brightRed(await date(), `[${Number(parseInt(i) + 1)}] [${csv[i].Email}] Switch proxy`))
          duplicity = await register(csv[i], csvproxy[proxyid])
        }

        if (duplicity != true) {
          error = await genAccountFunction(csv[i], csvproxy[proxyid])
          while (error == -1) {
            proxyid++
            if ((proxyid + 1) > csvproxy.length) {
              console.log(colors.brightRed(await date(), "[Error][" + csv[i].Email + "] All proxies are used"))
              console.log('\nPlease reboot the bot')
              await sleep(100000000)
            }
            console.log(colors.brightRed(await date(), `[${Number(parseInt(i) + 1)}] [${csv[i].Email}] Switch proxy`))
            error = await genAccountFunction(csv[i], csvproxy[proxyid])
          }

          console.log(colors.green(await date(), `[${Number(parseInt(i) + 1)}] [${csv[i].Email}] The account has been successfully created`))
          success++
          try {
            discordRaffle(csv[i], config[0].webhook, csvproxy[proxyid], 'success')
          } catch (err) { }


        } else {
          console.log(colors.brightRed(await date(), `[${Number(parseInt(i) + 1)}] [${csv[i].Email}] Account already exist`))

          try {
            discordRaffle(csv[i], config[0].webhook, csvproxy[proxyid], 'failed')
          } catch (err) { }

        }



        await pourcentage(parseInt(i) + 1, csv.length, version, success)
        if((proxyid + 1) > csvproxy.length){
          console.log(colors.brightRed(await date(), "[Error][" + csv[i].Email + "] All proxies are used"))
          console.log('\nPlease reboot the bot')
          await sleep(100000000)
        }
        if (csv.length != i + 1) {
          await range(first, second)
          proxyid++
        }
      }

      console.log(colors.green(await date(), 'All tasks are completed'))
      console.log('\nPlease reboot the bot')
      await sleep(99000000)
    }
  } else {
    console.log(colors.brightRed('The file raffle.csv is empty'))
    await sleep(5000)
  }
}

module.exports = {
  genAccount,
}
