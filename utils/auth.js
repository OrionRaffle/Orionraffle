const path = require('path')
const mysql = require('mysql')
const { machineId } = require('node-machine-id')
const { host, user, password, database } = require(path.join(__dirname, '../config/config'))

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function updateMachineId(key, localMachineId) {
  const connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
  })
  connection.connect()
  let query = `UPDATE orion_user SET machineId="${localMachineId}" WHERE pw="${key}"`
  connection.query(query, (error) => { if (error) throw error; })
  connection.end()
}
async function updateLastConnexionDate(key) {
  const connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
  })
  connection.connect()
  let query = `UPDATE orion_user SET lastLogin=NOW() WHERE pw="${key}"`
  connection.query(query, (error) => { if (error) throw error; })
  connection.end()
}
async function connexion(key, version, reject, resolve) {
  const connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
  })
  connection.connect()

  const getUserQuery = `SELECT user, machineId from orion_user where pw="${key}"`;
  const updateQuery = `UPDATE orion_user SET currentVersion="${version}" WHERE pw="${key}"`;

  connection.query(getUserQuery, async (error, results) => {
    if (error) throw error
    if (results.length != 1) reject('Invalid licence key')
    else {
      const user = results[0].user;
      const databaseMachineId = results[0].machineId;
      const localMachineId = await machineId();

      if(databaseMachineId==='') updateMachineId(key, localMachineId)
      else if(databaseMachineId!==localMachineId) reject('Wrong machine, open a ticket for more informations')

      updateLastConnexionDate(key)
      resolve(user)
    }
  })
  connection.query(updateQuery, (error) => { if (error) throw error; })
  connection.end()
}

async function auth(key, version, reject, resolve) {
  return await connexion(key, version, reject, resolve)
}
module.exports = {
  auth,
}
