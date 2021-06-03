const mysql = require('mysql')
const Downloader = require('node-url-downloader')
const path = require('path')
const { storageUrl, host, user, password, database } = require(path.join(__dirname, '../config/config'))
const { spawn, exec } = require('child_process')
const download = require('download')
const fs = require('fs')
const { exception } = require('console')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function downloadNewVersion(newVersion) {
  (async () => {
    await download(
      `${storageUrl}${newVersion}.exe`,
      `./`
    )
    await promiseBlindExecute(`OrionRaffle-${newVersion}.exe`)
    process.exit()
  })()
}

function promiseBlindExecute(command) {
  return new Promise((resolve) => {
    spawn(command, [], { shell: true, detached: true })
    setTimeout(resolve, 1000)
  })
}

async function checkRemoteVersion(callback) {
  const connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
  })
  connection.connect()

  let query = `SELECT remoteVersion from orion_version where id=1`
  connection.query(query, (error, results) => {
    if (error) throw error;
    if(results.length!=1) throw 'No remote version';
    callback(results[0].remoteVersion);
  })
  connection.end()
}

async function checkVersion(localVersion, resolve){
  function handleRemoteVersionResult(version) {
    if(localVersion===version) resolve();
    else{
      console.log(`New version available : ${version}`);
      console.log('Downloading new version..');
      downloadNewVersion(version)
    }
  }
  console.log('Checking Version..')
  await checkRemoteVersion(handleRemoteVersionResult)
}

module.exports = {
  checkVersion,
}
