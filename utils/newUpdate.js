const mysql = require('mysql')
const Downloader = require('node-url-downloader')
const path = require('path')
const { spawn, exec } = require('child_process')
const download = require('download')
const fs = require('fs')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function downloadt(newVersion) {
  ;(async () => {
    await download(
      `http://orionraffle-download.alwaysdata.net/OrionRaffle-${newVersion}.exe`,
      `./`
    )
    // fs.writeFileSync(`./OrionRaffle-${newVersion}.exe`, await download(`http://orionraffle-download.alwaysdata.net/OrionRaffle-${newVersion}.exe`));
    await promiseBlindExecute(`OrionRaffle-${newVersion}.exe`)
    process.exit()
  })()
}

function promiseBlindExecute(command) {
  return new Promise((resolve, reject) => {
    spawn(command, [], { shell: true, detached: true })
    setTimeout(resolve, 1000)
  })
}

async function checkRemoteVersion() {
  let v

  const connection = mysql.createConnection({
    host: '185.31.40.53',
    user: 'orion',
    password: '785421BG',
    database: 'orion_user',
  })

  connection.connect()
  q = `SELECT remoteVersion from orion_version where id=1`
  connection.query(q, (error, results) => {
    if (error) throw error
    v = results[0]
  })
  // a = `SELECT remoteVersion from orion_version where id=1`
  // connection.query(q, function (error, results) {

  //     if (error) throw error
  //     v = results[0]

  // });
  await sleep(1500)
  connection.end()
  return v.remoteVersion
}

async function checkVersion(version) {
  const newVersion = await checkRemoteVersion()

  console.log('Checking Version..')
  if (version === newVersion) {
    console.log('No update available')
    await sleep(1000)
    console.clear()
  } else {
    console.log(`New version available : ${newVersion}`)
    console.log('Downloading new version..')
    patht = path.join(__dirname, '../')
    await downloadt(newVersion)
    while (true) {
      await sleep(1000)
    }
  }
}

module.exports = {
  checkVersion,
}
