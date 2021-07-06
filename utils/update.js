const path = require('path');
const mysql = require('mysql');
const { storageUrl, host, user, password, database } = require('../config/config');
const { spawn } = require('child_process');
const download = require('download');


/** Download new version and lunch it
* @author   bstn
* @param    {String} newVersion           New version
*/
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
/** Execute command after 1 second (to lunch bot after update)
* @author   bstn
* @param    {String} command           Commande
*/
function promiseBlindExecute(command) {
  return new Promise((resolve) => {
    spawn(command, [], { shell: true, detached: true })
    setTimeout(resolve, 1000)
  })
}
/** Get la current version sur la dtb
* @author   bstn
* @param    {function} callback           Callback pour gérer la remote version
*/
async function getRemoteVersion(callback) {
  const connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
  })
  connection.connect()

  let query = `SELECT remoteVersion from orion_version where id=2`
  connection.query(query, (error, results) => {
    if (error) throw error;
    if (results.length != 1) throw 'No remote version';
    callback(results[0].remoteVersion);
  })
  connection.end()
}
/** Check si la version est à jour
* @author   bstn
* @param    {function} callback           Callback pour gérer la remote version
*/
async function checkVersion(localVersion, resolve) {
  async function handleRemoteVersionResult(version) {
    if (localVersion == version) await resolve();
    else {
      console.log(`New version available : ${version}`);
      console.log('Downloading new version..');
      downloadNewVersion(version);
    }
  }
  console.log('Checking Version..')
  await getRemoteVersion(handleRemoteVersionResult)
}

module.exports = {
  checkVersion,
}
