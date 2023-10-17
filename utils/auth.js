const mysql = require('mysql')
const { machineId } = require('node-machine-id')

let machineid

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function connexion(key, version) {
  let user
  const connection = mysql.createConnection({})

  connection.connect()
  q = `SELECT user from orion_user where pw="${key}"`
  x = `SELECT lastLogin from orion_user where pw="${key}"`
  a = `SELECT machineId from orion_user where pw="${key}"`
  b = `UPDATE orion_user SET currentVersion="${version}" WHERE pw="${key}"`

  connection.query(q, (error, results) => {
    if (error) throw error

    user = results[0]
  })
  connection.query(x, (error, results) => {
    if (error) throw error

    lastlogin = results[0]
  })

  connection.query(b, (error, results) => {
    if (error) throw error
  })

  connection.query(a, (error, results) => {
    if (error) throw error

    currentMachineID = results[0]
  })

  await sleep(1500)

  if (user === undefined) {
    console.log('[Error] Invalid licence key')
    connection.end()
    return false
  }

  machineid = await machineId()

  if (currentMachineID.machineId === '') {
    m = `UPDATE orion_user SET machineId="${machineid}" WHERE pw="${key}"`
    connection.query(m, (error, results) => {
      if (error) throw error
    })

    currentMachineID.machineId = machineid
  }

  await sleep(500)

  if (machineid !== currentMachineID.machineId) {
    console.log('[Error] Wrong machine, open a ticket for more informations')
    connection.end()
    return false
  }

  const date = new Date()

  q = `UPDATE orion_user SET lastLogin="${String(date)}" WHERE pw="${key}"`
  connection.query(q, (error, results) => {
    if (error) throw error
  })
  connection.end()

  return user.user
}

async function auth(key, version) {
  i = await connexion(key, version)
  return i
}
module.exports = {
  auth,
}
