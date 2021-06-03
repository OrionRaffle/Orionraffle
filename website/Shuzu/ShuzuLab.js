const inputReader = require('wait-console-input')
const figlet = require('figlet')
const colors = require('colors')
const clear = require('console-clear')
const setTitle = require('node-bash-title')
const { Webhook, MessageBuilder } = require('discord-webhook-node')
const chalk = require('chalk')
var readline = require('readline')
const { genAccount } = require('./accountGen')
const { shuzuRaffle } = require('./shuzuRaffle')

colors.enable()

async function menu() {
  clear()
  console.log(chalk.rgb(247,158,2)(figlet.textSync(' Orion', {font: 'Larry 3D',horizontalLayout: 'fitted',})))
  console.log(`\nWelcome ${`${user}`.magenta}`)
  console.log('\nShuzuLab mode')
  console.log('1 . Account Gen')
  console.log('2 . Raffle mode\n')
  console.log('3 . Back\n')
  input = inputReader.readLine()
  return input
}

colors.enable()

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function shuzu(version) {
  await sleep(500)

  choix = await menu()

  while (true) {
    // Update Mode
    switch (choix) {
      case '1':
        await genAccount(version)
        break

      case '2':
        await shuzuRaffle(version)
        break
      case '3': 
      return
    }
    choix = await menu()
  }
}

module.exports = {
  shuzu,
}
