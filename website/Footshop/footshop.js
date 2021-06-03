const inputReader = require('wait-console-input')
const figlet = require('figlet')
const colors = require('colors')
const clear = require('console-clear')
const setTitle = require('node-bash-title')
const chalk = require('chalk')
const { stockChecker } = require('./stockChecker')
const { footshopRaffle } = require('./footshopRaffle')

const yolo = 1

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
  console.log(`\nWelcome ${`${user}`.magenta}`)
  console.log('\nFootshop mode')
  console.log('1 . Stock checker')
  console.log('2 . Raffle mode\n')
  console.log('3 . Back\n')
  input = inputReader.readLine()
  return input
}

colors.enable()

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function footshop(version) {
  await sleep(500)

  choix = await menu()

  while (true) {
    // Update Mode
    switch (choix) {
      case '1':
        await stockChecker()
        break
      case '2':
        await footshopRaffle(version)
        break
      case '3':
        return
      default:
    }
    choix = await menu()
  }
}

module.exports = {
  footshop,
}
