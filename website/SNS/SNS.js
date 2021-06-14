const inputReader = require('wait-console-input')
const figlet = require('figlet')
const colors = require('colors')
const clear = require('console-clear')
const { Webhook, MessageBuilder } = require('discord-webhook-node')
const chalk = require('chalk')
const {
  csvrafflereaderSNS,
  csvupdatereaderSNS,
  csvproxyreader,
  csvconfigreader,
} = require('../../init')
const { entry } = require('./entry/entry')
const { update } = require('./update/update')
const { raffleData } = require('./login/raffleData')
const { getRaffleId, removeRaffleId } = require('./login/raffleFunction')
const { login } = require('./login/login')

colors.enable()

async function menu() {
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
  console.log('\nSNS mode')
  console.log('1 . Update mode (Maintenance)')
  console.log('2 . Raffle mode\n')
  console.log('3 . Back\n')

  input = inputReader.readLine()
  return input
}

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

colors.enable()

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

function discordRaffle(csv, webhook, proxy, size, raffleId, state) {
  if (state == 'success') {
    color = '#18cc36'
    title = 'Success Entry ✨'
  } else {
    color = '#EE2016'
    title = 'Fail Entry'
  }

  if (webhook != '') {
    if (webhook != undefined) {
      if (proxy.ip == undefined) {
        proxy = 'No proxy'
      } else {
        proxy = `${proxy.ip}:${proxy.port}:${proxy.user}:${proxy.password}`
      }
      const hook = new Webhook(webhook)

      const embed = new MessageBuilder()
        .setAuthor('OrionRaffle')
        .setTitle(title)
        .addField('Raffle Type', 'SNS', true)
        .addField('Email', `${csv.Email}`, true)
        .addField('Password', `||${csv.Password}||`, true)
        .addField('RaffleId', `${raffleId}`, true)
        .addField('Size', `${size.split('-').pop()} US`, true)
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

function discordUpdate(csv, webhook, proxy, state) {
  if (state == 'success') {
    color = '#18cc36'
    title = 'Success Update ✨'
  } else {
    color = '#EE2016'
    title = 'Fail Update'
  }
  if (webhook != '') {
    if (proxy.ip == undefined) {
      proxy = 'No proxy'
    } else {
      proxy = `${proxy.ip}:${proxy.port}:${proxy.user}:${proxy.password}`
    }
    const hook = new Webhook(webhook)

    const embed = new MessageBuilder()
      .setAuthor('OrionRaffle')
      .setTitle(title)
      .addField('Email', `${csv.Email}`, true)
      .addField('Password', `||${csv.Password}||`, true)
      .addField('FirstName', `${csv.FirstName}`, true)
      .addField('LastName', `${csv.LastName}`, true)
      .addField('Country', `${csv.Country}`, true)
      .addField('Address', `${csv.Address}`, true)
      .addField('PostalCode', `${csv.PostalCode}`, true)
      .addField('City', `${csv.City}`, true)
      .addField(
        'CardNumber',
        `||${csv.CardNumber} ${csv.MM}/${csv.YYYY} ${csv.CVC}||`,
        true
      )
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

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function pourcentage(i, length, version, success) {
  instance = process.cwd()
  instance = instance.split('\\').pop()

  const setTitle = require('node-bash-title')
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

async function SNS(version) {
  let first
  let second
  config = await csvconfigreader()

  await sleep(500)

  choix = await menu()

  while (true) {
    // Update Mode
    if (choix == 9998) {
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
      console.log(chalk.rgb(247, 158, 2)('SNS | Update Mode'))
      console.log('-------------------------------------------\n')
      csv = await csvupdatereaderSNS()
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
          console.log('[Info] Range between each task ? (First number) (s)')
          first = inputReader.readInteger()
          console.log('[Info] Range between each task ? (Second number) (s)')
          second = inputReader.readInteger()
          console.log(`[Info] Range ${first} - ${second}`)
          await sleep(500)

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

          console.log(chalk.rgb(247, 158, 2)('\nSNS | Update Mode'))
          console.log('-------------------------------------------\n')
          console.log('[Info] Start tasks..')
          var proxyid = 0
          var success = 0
          await pourcentage(0, 0, version, 0)
          for (i in csv) {
            if (
              csv[i].AddAddress == 'false' &&
              csv[i].AddNumber == 'false' &&
              csv[i].AddCC == 'false'
            ) {
              success++
              console.log(
                colors.green(
                  await date(),
                  `[${Number(parseInt(i) + 1)}] [${csv[i].Email
                  }] No update for this account`
                )
              )
            } else {
              await sleep(1000)
              if (repproxy != 'yes') {
                csvproxy[proxyid] = 0
              }

              erreurlogin = await login(csv[i], csvproxy[proxyid])
              while (erreurlogin == -1) {
                proxyid++
                erreurlogin = await login(csv[i], csvproxy[proxyid])
              }
              if (erreurlogin != 0) {
                console.log(
                  colors.green(
                    await date(),
                    `[${Number(parseInt(i) + 1)}] [${csv[i].Email
                    }] Successful login`
                  )
                )
                await sleep(2000)

                erreurupdate = await update(
                  csv[i],
                  csvproxy[i],
                  config[0].SMSActivateAPI,
                  Number(parseInt(i) + 1)
                )
                while (erreurupdate == -1) {
                  proxyid++
                  erreurupdate = await update(
                    csv[i],
                    csvproxy[i],
                    config[0].SMSActivateAPI,
                    Number(parseInt(i) + 1)
                  )
                }
                if (erreurupdate != 0) {
                  console.log(
                    colors.green(
                      await date(),
                      `[${Number(parseInt(i) + 1)}] [${csv[i].Email
                      }] Successful update`
                    )
                  )
                  success++

                  try {
                    discordUpdate(
                      csv[i],
                      config[0].webhook,
                      csvproxy[proxyid],
                      'success'
                    )
                  } catch (err) { }
                } else {
                  try {
                    discordUpdate(
                      csv[i],
                      config[0].webhook,
                      csvproxy[proxyid],
                      'failed'
                    )
                  } catch (err) { }
                }
              } else {
                try {
                  discordUpdate(
                    csv[i],
                    config[0].webhook,
                    csvproxy[proxyid],
                    'failed'
                  )
                } catch (err) { }
              }
            }
            if (csvproxy.length <= proxyid) {
              console.log(
                colors.red(
                  await date(),
                  'There is no more proxy available in proxy.txt'
                )
              )
              console.log('\nPlease reboot the bot')
              await sleep(100000000)
            }
            await pourcentage(parseInt(i + 1), csv.length, version, success)
            if (csv.length != i + 1) {
              await range(first, second)
              proxyid++
            }
          }
          console.log(colors.green(await date(), 'All tasks are completed'))
          console.log('\nPlease reboot the bot')
          await sleep(100000000)
        }
      } else {
        console.log(colors.brightRed('The file update.csv is empty'))
        await sleep(2000)
        return
      }

      // Raffle Mode
    } else if (choix == 2) {
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
      console.log(chalk.rgb(247, 158, 2)('\nSNS | Raffle Mode'))
      console.log('-------------------------------------------\n')

      raffleTab = []
      csvraffle = await csvrafflereaderSNS()
      await sleep(500)
      if (!csvraffle.length == 0) {
        idSNS = await getRaffleId()

        if (idSNS.length == 0) {
          console.log('\n[Info] No raffle at this moment\n')
          await sleep(2000)
          return
        }
        json = await raffleData(csvraffle[0])

        if (json == 0) {
          console.log(
            colors.brightRed(
              '[Error] A valid SNS account is required to access the raffle mode'
            )
          )
          await sleep(5000)
          return
        }

        for (i = 0; i < json.configurations.length; i++) {
          for (j = 0; j < idSNS.length; j++) {
            if (json.configurations[i].raffleId == idSNS[j].idRaffle) {
              if (json.configurations[i].configuration.status == 'live') {
                raffleTab.push(json.configurations[i].configuration)
              } else {
                await removeRaffleId(json.configurations[i].raffleId)
              }
            }
          }
        }
        await sleep(100)

        for (i = 0; i < raffleTab.length; i++) {
          nameRaffle = raffleTab[i].product.colors.replace(/\n/g, '')

          console.log(
            ` ${i + 1}. ${raffleTab[i].product.name} ${nameRaffle} / ${raffleTab[i].product.artNo
            }`
          )
        }

        console.log('\n-------------------------------------------\n')

        var input
        input = inputReader.readInteger()

        while (true) {
          if (input <= raffleTab.length && input > 0) {
            break
          }
          input = inputReader.readInteger()
        }

        idRaffle = raffleTab[input - 1].raffleId

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
        console.log(chalk.rgb(247, 158, 2)('\nSNS | Raffle Mode'))
        console.log('-------------------------------------------\n')
        console.log(chalk.rgb(180, 180, 190)(raffleTab[input - 1].product.name))

        await sleep(10)
        let Women = ''
      
        try {
          if (raffleTab[input - 1].sizes[0].conversions[0].value.includes('W')) {
           
            Women = 'W'
          }
        } catch (e) { }
        const globalTabRange = []
        for (j = 0; j < raffleTab[input - 1].sizes.length; j++) {
          if (Women != '') {
            globalTabRange.push(Number(raffleTab[input - 1].sizes[j].conversions[0].value.replace(/W/g, '')))
          } else {
            globalTabRange.push(Number(raffleTab[input - 1].sizes[j].conversions[0].value)
            )
          }
        }
      
        console.log('\nSize available :', ...globalTabRange)

        console.log('\nFrom Size ?')
        FromSize = inputReader.readFloat()
        console.log('To Size')
        ToSize = inputReader.readFloat()
        if (FromSize > ToSize) return

        tabRange = []
        tabRangeId = []

        for (j = 0; j < globalTabRange.length; j++) {
          if (globalTabRange[j] >= FromSize && globalTabRange[j] <= ToSize) {
            tabRange.push(globalTabRange[j])
            tabRangeId.push(raffleTab[input - 1].sizes[j].externalReference)
          }
        }
        console.log(`\n[Info] Size range :`, ...tabRange)

        if (tabRange == '') {
          console.log(`[Error] Wrong size`)
          await sleep(5000)
          return
        }

        console.log('\n-----------------------------------------------------\n')

        console.log('[Info] Use proxy ? (yes/no)')
        repproxy = inputReader.readLine()

        if (repproxy == 'yes') {
          console.log('[Info] Proxy mode')
          var csvproxy = await csvproxyreader()
        } else {
          var csvproxy = new Array(csvraffle.length)
          console.log('[Info] Proxyless mode')
        }


        console.log('\n-----------------------------------------------------\n')
        console.log('Range between each task ? (First number) (s)')
        first = inputReader.readInteger()
        console.log('Range between each task ? (Second number) (s)')
        second = inputReader.readInteger()
        console.log(`[Info] Range ${first} - ${second} seconds`)
        console.log('\n-----------------------------------------------------\n')
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
        console.log(chalk.rgb(247, 158, 2)('\nSNS | Raffle Mode'))
        console.log('-------------------------------------------\n')

        console.log(raffleTab[input - 1].product.name)

        console.log('\n[Info] Start tasks..')

        var proxyid = 0
        var success = 0

        await pourcentage(0, 0, version, 0)
        for (i in csvraffle) {
          size = tabRangeId[Math.floor(Math.random() * tabRangeId.length)]
          await sleep(1000)
          if (repproxy != 'yes') {
            proxy = 0
          } else if (csvraffle[i].CustomProxy != '') {
            proxy = csvraffle[i].CustomProxy
            proxy = proxy.split(':')
            proxy = {
              ip: proxy[0],
              port: proxy[1],
              user: proxy[2],
              password: proxy[3],
            }
            console.log(
              colors.green(
                await date(),
                `[${Number(parseInt(i) + 1)}] [${csvraffle[i].Email
                }] Custom proxy for this task`
              )
            )
          } else {
            proxy = csvproxy[proxyid]
          }

          if (Object.keys(csvraffle[i]).length < 3) {
            console.log(
              colors.brightRed(
                `[${csvraffle[i].Email}] Too much or too little information in raffle.csv`
              )
            )
            continue
          }

          erreurlogin = await login(csvraffle[i], proxy)
          while (erreurlogin == -1) {
            if ((proxyid + 1) > csvproxy.length) {
              console.log(colors.brightRed(await date(), "[Error] All proxies are used"))
              console.log('\nPlease reboot the bot')
              await sleep(100000000)
            }
            console.log(await date(), `[${Number(parseInt(i) + 1)}] [${csvraffle[i].Email}] Rotate proxy`)
            if (csvraffle[i].CustomProxy != '') {
              console.log(await date(), `[${Number(parseInt(i) + 1)}] [${csvraffle[i].Email}] Custom proxy will be switch with a proxy from proxy.txt`)
              erreurlogin = await login(csvraffle[i], csvproxy[proxyid])
              proxy = csvproxy[proxyid]
              proxyid++
            } else {
              proxyid++
              proxy = csvproxy[proxyid]
              erreurlogin = await login(csvraffle[i], proxy)
            }
          }
          if (erreurlogin != 0) {
            console.log(colors.green(await date(), `[${Number(parseInt(i) + 1)}] [${csvraffle[i].Email}] Successful login`))
            await sleep(2000)

            erreurraffle = await entry(csvraffle[i], proxy, idRaffle, size)
            while (erreurlogin == -1) {
              if ((proxyid + 1) > csvproxy.length) {
                console.log(colors.brightRed(await date(), "[Error] All proxies are used"))
                console.log('\nPlease reboot the bot')
                await sleep(100000000)
              }
              console.log(await date(), `[${Number(parseInt(i) + 1)}] [${csvraffle[i].Email}] Rotate proxy`)
              if (csvraffle[i].CustomProxy != '') {
                console.log(await date(), `[${Number(parseInt(i) + 1)}] [${csvraffle[i].Email}] Custom proxy will be switch with a proxy from proxy.txt`)
                erreurraffle = await entry(csvraffle[i], csvproxy[proxyid], idRaffle, size)
                proxy = csvproxy[proxyid]
                proxyid++
              } else {
                proxyid++
                proxy = csvproxy[proxyid]
                erreurraffle = await entry(csvraffle[i], csvproxy[proxyid], idRaffle, size)
              }
            }
            if (erreurraffle != 0) {
              console.log(colors.green(await date(), `[${Number(parseInt(i) + 1)}] [${csvraffle[i].Email}] Successfully entered the raffle`))
              success++

              try {
                discordRaffle(csvraffle[i], config[0].webhook, proxy, size, idRaffle, 'success')
              } catch (err) { }
            } else {
              try {
                discordRaffle(
                  csvraffle[i],
                  config[0].webhook,
                  proxy,
                  size,
                  idRaffle,
                  'failed'
                )
              } catch (err) { }
            }
          } else {
            try {
              discordRaffle(
                csvraffle[i],
                config[0].webhook,
                proxy,
                size,
                idRaffle,
                'failed'
              )
            } catch (err) { }
          }

          if (csvproxy.length <= proxyid) {
            console.log(colors.red(await date(), 'There is no more proxy available in proxy.txt'
            )
            )
            console.log('\nPlease reboot the bot')
            await sleep(100000000)
          }
          await pourcentage(parseInt(i) + 1, csvraffle.length, version, success)
          if (csvraffle.length != i + 1) {
            await range(first, second)
            proxyid++
          }
        }
        console.log(colors.green(await date(), 'All tasks are completed'))
        console.log('\nPlease reboot the bot')
        await sleep(100000000)
      } else {
        console.log(colors.brightRed('The file raffle.csv is empty'))
        await sleep(2000)
        return
      }
    } else if (choix == 3) {
      return
    }
    choix = await menu()
  }
}


module.exports = {
  SNS
}