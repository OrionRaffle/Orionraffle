/* eslint-disable camelcase */
const path = require('path')
const figlet = require('figlet')
const colors = require('colors')
const setTitle = require('node-bash-title')
const chalk = require('chalk')
const clear = require('console-clear')
const inputReader = require('wait-console-input')
const { auth } = require('./utils/auth')
const { csvReadClientAuth } = require(path.join(__dirname, 'gateway/csvReader'))
const { checkVersion } = require(path.join(__dirname, 'utils/update.js'));
const { SNS } = require('./website/SNS/SNS')
// const { shuzu } = require('./website/Shuzu/ShuzuLab')
// const { kith } = require('./website/KithEU/kithRaffle')
// const { footlocker } = require('./website/FootLocker/FootLocker')
const { courir } = require('./website/CourirOnline/courir')
const { footshop } = require('./website/Footshop/footshop')
const { courirInstore } = require('./website/CourirInstore/courirInstore')

//Get package.json data
var pjson = require('./package.json');

const version = pjson.version;
let discordUsername;

async function display() { // A quoi ça sert?
  displayHeader()
  console.log(`\nWelcome ${`${discordUsername}`.magenta}`)
  setTitle(`OrionRaffle | Private Beta | V.${version} | ${discordUsername}`)
}

async function menu() {
  displayHeader()
  console.log(`\nWelcome ${`${discordUsername}`.magenta}`)
  console.log('\n1 . SNS')
  console.log('2 . Footshop (Maintenance)')
  console.log('3 . Courir Online')
  console.log('4 . Courir Instore')
  console.log('5 . ShuzuLab (Maintenace)\n')

  // console.log("4 . FootLocker Instore\n")
  input = inputReader.readLine()
  return input
}

try {
  const client = require('discord-rich-presence')('812828492474613780')

  client.on('unhandledRejection', () => {
    rpc_client = null
  })
  client.on('error', () => {
    rpc_client = null
  })
  client.updatePresence({
    details: `Version: ${version}`,
    startTimestamp: Date.now(),
    largeImageKey: 'orionlogoverybig',
    instance: true,
  })
} catch { }

colors.enable()

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  async function databaseAuthentification(data) {
    authResult = await auth(data.LicenceKey, version, reject, authAccepted)
  }
  async function reject(error) {
    console.log("[ERROR] : " + error)
    await sleep(10000)
    process.exit(1)
  }
  async function authAccepted(user) {
    discordUsername = user;
    await checkVersion(version, versionUpToDate)
  }
  async function versionUpToDate() {
    console.log('Version up to date')
    await sleep(1000)
    console.clear()
    console.log("Display menu")
    displayMenu()
  }
  async function displayMenu() {
    while (true) {
      choice = await menu(version)
      switch (choice) {
        case '1':
          await SNS(version)
          break
        case '2':
          await footshop(version)
          break
        case "3":
          await courir(version)
          break
        // case "5":
        //   await footlocker(version)
        //   break
        case "4":
          await courirInstore(version)
          break
        // case "5":
        //   await shuzu(version)
        //   break

        // case "6":
        //   await kith(version)
        //   break
        default:
          console.log('Wrong input')
          break;
      }
    }
  }
  await csvReadClientAuth(databaseAuthentification)
}

function displayHeader() {
  clear()
  console.log(
    chalk.rgb(247,158,2)(
      figlet.textSync(' Orion', {
        font: 'Larry 3D',
        horizontalLayout: 'fitted',
      })
    )
  )
}
main()