const inputReader = require('wait-console-input')
const figlet = require('figlet')
const colors = require('colors')
const clear = require('console-clear')
const setTitle = require('node-bash-title')
const chalk = require('chalk')
const readline = require('readline')
const { csvproxyreader } = require('../../init')
const { getRaffleId, getRaffleData } = require('./footshopFunction')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function stockChecker() {
  const raffleData = []
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
  console.log(chalk.rgb(247, 158, 2)('\n Footshop | Stock checker'))
  console.log('-----------------------------------------------------\n')

  csvproxy = await csvproxyreader()
  await sleep(500)
  if (csvproxy == 0) {
    console.log('\n[Info] Proxy required')
    await sleep(4000)
    return
  }

  idFootshop = await getRaffleId()
  if (idFootshop.length == 0) {
    console.log('\n[Info] No raffle at this moment\n')
    await sleep(2000)
    return
  }
  for (i = 0; i < idFootshop.length; i++) {
    data = await getRaffleData(idFootshop[i].idRaffle, csvproxy[0])
    raffleData.push(data)
  }

  for (i = 0; i < idFootshop.length; i++) {
    console.log(
      ` ${i + 1}. ${raffleData[i].translations.en.title} ${
        raffleData[i].translations.en.subtitle
      }`
    )
  }

  console.log('\n-----------------------------------------------------\n')

  let input
  input = inputReader.readLine()
  while (true) {
    if (input <= idFootshop.length && choix > 0) {
      break
    }
    input = inputReader.readLine()
  }

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
  console.log(chalk.rgb(247, 158, 2)('\n Footshop | Stock checker'))
  console.log('-----------------------------------------------------\n')
  console.log(
    chalk.rgb(180, 180, 190)(`${raffleData[input - 1].translations.en.title}\n`)
  )
  for (i = 0; i < tabSizes.length; i++) {
    console.log(` ${tabSizes[i].us} US : ${tabSizes[i].pieces} pieces`)
  }

  await sleep(10000)
}

module.exports = {
  stockChecker,
}
