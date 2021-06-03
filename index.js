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

async function display() {
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
  setTitle(`OrionRaffle | Private Beta | V.${version} | ${user}`)
}

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
    console.log("[ERROR] : "+error)
    await sleep(10000)
    process.exit(1)
  }
  async function authAccepted(user) {
    console.log('AUTH SUCCESS : '+user)
    await checkVersion(version, versionUpToDate)
  }
  async function versionUpToDate() {
    console.log('Version up to date')
    await sleep(1000)
    console.clear()
    console.log(Date.now() - start)
  }
  let start = Date.now();
  await csvReadClientAuth(databaseAuthentification)




  await sleep(10000)
  process.exit(1)

  await checkVersion(version)

  await display()



  choix = await menu()

  while (true) {
    switch (choix) {
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
    }

    choix = await menu(version)
  }
}

main()
