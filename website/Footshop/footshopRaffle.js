const inputReader = require('wait-console-input')
const figlet = require('figlet')
const colors = require('colors')
const clear = require('console-clear')
const setTitle = require('node-bash-title')
const chalk = require('chalk')
const lineReader = require('line-reader')
const { Webhook, MessageBuilder } = require('discord-webhook-node')
const {
  csvrafflereaderFootshop,
  csvproxyreader,
  csvconfigreader,
} = require('../../init')
const {
  getRaffleId,
  checkDuplicity,
  getRaffleData,
  tokenCC, 
  signUpCB,
  signUpInfo,
  getIdHcaptcha,
  getTokenHcaptcha,
} = require('./footshopFunction')

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

async function getRandomLineTab() {
  const array = []
  lineReader.eachLine('./website/Footshop/insta.txt', (line) => {
    array.push(line)
  })

  await sleep(500)
  return array
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

function discordRaffle(csv, webhook, proxy, titleRaffle, link, size, state) {
  if (state == 'success') {
    color = '#18cc36'
    title = 'Success Entry ✨'
    link = `[3DS Link](${link})`
  } else {
    color = '#EE2016'
    title = 'Fail Entry'
    link = 'No 3DS'
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
        .setTitle(title)
        .addField('Raffle Type', 'FootShop', true)
        .addField('Email', `${csv.Email}`, true)
        .addField('Raffle', `${titleRaffle}`, true)
        .addField('Size', `${size} US`, true)
        .addField('Proxy', `||${proxy}||`, true)
        .addField('3DS Secure', link)
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
async function footshopRaffle(version) {
  let first
  let second
  let FromSize
  let ToSize
  const raffleData = []
  const tabRange = []
  const tabRangeSku = []
  const tabInsta = []
  let signUpData

  config = await csvconfigreader()
  csv = await csvrafflereaderFootshop()

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
  console.log(chalk.rgb(247, 158, 2)('\n Footshop | Raffle Mode'))
  console.log('-----------------------------------------------------\n')

  csvproxy = await csvproxyreader()
  await sleep(500)
  if (csvproxy == 0) {
    console.log('\n[Info] Proxy required')
    await sleep(4000)
    return
  }

  if (config[0].Key2Captcha == '') {
    console.log('\n[Info] 2Captcha Key required')
    await sleep(4000)
    return
  }

  idFootshop = await getRaffleId()

  await sleep(500)
  if (idFootshop.length == 0) {
    console.log('\n[Info] No raffle at this moment\n')
    await sleep(2000)
    return
  }

  for (i = 0; i < idFootshop.length; i++) {
    data = await getRaffleData(idFootshop[i].idRaffle, csvproxy[0])
    raffleData.push(data)
  }

  if (raffleData[0] == undefined) {
    console.log(colors.brightRed('[Error] Proxy error'))
    console.log('\nPlease reboot the bot')
    await sleep(100000000)
  }

  for (i = 0; i < idFootshop.length; i += 1) {
    console.log(` ${i + 1}. ${raffleData[i].translations.en.title} ${raffleData[i].translations.en.subtitle}`
    )
  }

  console.log('\n-------------------------------------------\n')

  let input

  input = inputReader.readInteger()
  await sleep(100)
  while (true) {
    if (input <= idFootshop.length && input > 0) {
      break
    }
    input = inputReader.readInteger()
  }

  idRaffle = raffleData[input - 1].id

  let tabSizes = []

  if (raffleData[input - 1].sizeSets.Men.sizes != '') {
    tabSizes = raffleData[input - 1].sizeSets.Men.sizes
  } else if (raffleData[input - 1].sizeSets.Women.sizes != '') {
    tabSizes = raffleData[input - 1].sizeSets.Women.sizes
  } else {
    tabSizes = raffleData[input - 1].sizeSets.Unisex.sizes
  }

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
  console.log(chalk.rgb(247, 158, 2)('\n Footshop | Raffle Mode'))
  console.log('-----------------------------------------------------\n')

  console.log(
    chalk.rgb(180, 180, 190)(`${raffleData[input - 1].translations.en.title}\n`)
  )

  const globalTabRange = []
  for (j = 0; j < tabSizes.length; j++) {
    globalTabRange.push(tabSizes[j].us)
  }

  console.log('Size available :', ...globalTabRange)

  if (csv != 0) {
    if (csv.length > csvproxy.length) {
      console.log(
        colors.brightRed(
          `[Error] There are not enough proxies for the number of tasks, Proxy : ${csvproxy.length} / Tasks : ${csv.length}`
        )
      )
      await sleep(10000)
      return
    }

    console.log('\nFrom Size ?')
    FromSize = inputReader.readFloat()
    console.log('To Size')
    ToSize = inputReader.readFloat()
    if (FromSize > ToSize) return
    for (j = 0; j < tabSizes.length; j++) {
      if (tabSizes[j].us >= FromSize && tabSizes[j].us <= ToSize) {
        tabRange.push(tabSizes[j].us)
      }
    }
    if (tabRange == '') {
      console.log(`[Error] Wrong size`)
      await sleep(5000)
      return
    }
    console.log(`\n[Info] Size range :`, ...tabRange)

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
    console.log(chalk.rgb(247, 158, 2)('\n Footshop | Raffle Mode'))
    console.log('-----------------------------------------------------\n')

    console.log(
      chalk.rgb(
        180,
        180,
        190
      )(`${raffleData[input - 1].translations.en.title}\n`)
    )

    console.log('\n[Info] Start tasks..')

    let proxyid = 0
    tabRangeReal = []
    for (y = 0; y < tabSizes.length; y++) {
      for (x = 0; x < tabRange.length; x++)
        if (tabRange[x] == parseFloat(tabSizes[y].us)) {
          tabRangeSku.push(tabSizes[y].id)
          tabRangeReal.push(tabSizes[y].us)
        }
    }

    const tabLines = await getRandomLineTab()

    for (i = 0; i < 200; i++) {
      tabInsta.push(tabLines[Math.floor(Math.random() * tabLines.length)])
    }

    proxyid = 0
    success = 0
    await pourcentage(0, 0, version, 0)
    for (i in csv) {
      r = Math.floor(Math.random() * tabRangeSku.length)
      size = tabRangeSku[r]
      realSize = tabRangeReal[r]

      const phone = Math.floor(Math.random() * 9000000 + 10000000)

      erreur = await checkDuplicity(
        csv[i],
        phone,
        csvproxy[proxyid],
        raffleData[input - 1].id
      )
      while (erreur == -1) {
        proxyid++
        console.log(await date(), '[Info] Rotating proxies')
        erreur = await checkDuplicity(
          csv[i],
          phone,
          csvproxy[proxyid],
          raffleData[input - 1].id
        )
      }
      if (erreur.email != true) {
        token = await tokenCC(csv[i], csvproxy[proxyid])
        if (token != -1) {
          console.log(
            colors.green(
              await date(),
              `[${Number(parseInt(i) + 1)}] [${csv[i].Email
              }] No email duplication`
            )
          )
          console.log(
            colors.green(
              await date(),
              `[${Number(parseInt(i) + 1)}] [${csv[i].Email}] Solving Captcha..`
            )
          )

          idHcaptcha = await getIdHcaptcha(
            config[0].Key2Captcha,
            csvproxy[proxyid]
          )
          while (idHcaptcha == 1) {
            await sleep(5000)
            idHcaptcha = await getIdHcaptcha(
              config[0].Key2Captcha,
              csvproxy[proxyid]
            )
          }
          while (idHcaptcha == 0) {
            console.log(
              colors.brightRed(await date(), '[Info] Rotating proxies')
            )
            proxyid++
            idHcaptcha = await getIdHcaptcha(
              config[0].Key2Captcha,
              csvproxy[proxyid]
            )
            if (idHcaptcha == -1) {
              console.log('\nPlease reboot the bot')
              await sleep(100000000)
            }
            while (idHcaptcha == 1) {
              await sleep(5000)
              idHcaptcha = await getIdHcaptcha(config[0].Key2Captcha,csvproxy[proxyid])
            }
          }
          if (idHcaptcha == -1) {
            console.log('\nPlease reboot the bot')
            await sleep(100000000)
          }

          await sleep(10000)
          tokenHcaptcha = await getTokenHcaptcha(config[0].Key2Captcha,csvproxy[proxyid],idHcaptcha)
          while (tokenHcaptcha == 1) {
            await sleep(5000)
            tokenHcaptcha = await getTokenHcaptcha(config[0].Key2Captcha,csvproxy[proxyid],idHcaptcha)
          }
          while (tokenHcaptcha == 0) {
            console.log(colors.brightRed(await date(), '[Info] Rotating proxies')
            )
            proxyid++
            tokenHcaptcha = await getTokenHcaptcha(
              config[0].Key2Captcha,
              csvproxy[proxyid],
              idHcaptcha
            )
            while (tokenHcaptcha == 1) {
              await sleep(5000)
              tokenHcaptcha = await getTokenHcaptcha(config[0].Key2Captcha,csvproxy[proxyid],idHcaptcha)
            }
          }

          // registration

          signUpData = await signUpInfo(csv[i],csvproxy[proxyid],tokenHcaptcha,size,phone,tabInsta[i],raffleData[input - 1].id)

          if (signUpData != -1) {
            idUser = signUpData.registration.id
            signUpFinish = await signUpCB(token, csvproxy[proxyid], raffleData[input - 1].id, idUser)

            if (signUpFinish != -1 || signUpFinish.secure3DRedirectUrl != 'null') {
              console.log(colors.green(await date(), `[${Number(parseInt(i) + 1)}] [${csv[i].Email}] Successfully entered the raffle`))
              success++
              try {
                discordRaffle(csv[i],config[0].webhook,csvproxy[proxyid],raffleData[input - 1].translations.en.title,signUpFinish.secure3DRedirectUrl,realSize,'success')
              } catch (err) { }
            } else {
              console.log(
                colors.brightRed(
                  await date(),
                  `[Error] [${Number(parseInt(i) + 1)}] [${csv[i].Email
                  }] J1g detected`
                )
              )
              try {
                discordRaffle(
                  csv[i],
                  config[0].webhook,
                  csvproxy[proxyid],
                  raffleData[input - 1].translations.en.title,
                  null,
                  realSize,
                  'failed'
                )
              } catch (err) { }
            }
          } else {
            console.log(
              colors.brightRed(
                await date(),
                `[Error] [${Number(parseInt(i) + 1)}] [${csv[i].Email
                }] J1g detected`
              )
            )
            try {
              discordRaffle(
                csv[i],
                config[0].webhook,
                csvproxy[proxyid],
                raffleData[input - 1].translations.en.title,
                null,
                realSize,
                'failed'
              )
            } catch (err) { }
          }
        }
      } else {
        console.log(
          colors.brightRed(
            await date(),
            `[Error] [${Number(parseInt(i) + 1)}] [${csv[i].Email}] ` +
            `Email already use`
          )
        )
        try {
          discordRaffle(
            csv[i],
            config[0].webhook,
            csvproxy[proxyid],
            raffleData[input - 1].translations.en.title,
            null,
            realSize,
            'failed'
          )
        } catch (err) { }
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
      await pourcentage(parseInt(i) + 1, csv.length, version, success)
      if (csv.length != i + 1) {
        await range(first, second)
        proxyid++
      }
    }
  } else {
    console.log(colors.brightRed('[Error] No information'))
  }

  console.log('\nPlease reboot the bot')
  await sleep(100000000)
}

module.exports = {
  footshopRaffle,
}
