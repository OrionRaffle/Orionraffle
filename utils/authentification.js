const path = require('path')
const mysql = require('mysql')
const { machineId } = require('node-machine-id')
const { Console } = require('console')
//Config
const { host, user, password, database } = require('../config/config')

/** Update machine id in database (only on first login)
* @author   bstn
* @param    {String} key                  Bot key
* @param    {String} localMachineId       Local Machine id
*/
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
/** Update last login date to NOW() in database
* @author   bstn
* @param    {String} key        Bot key
*/
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
/** User Authentification
* @author   bstn
* @param    {String} key        Bot key
* @param    {String} version    Version
* @param    {function} name    Error handler
* @param    {function} name    Success handler
*/
async function authUser(key, version, reject, resolve) {
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
    if (error) return reject('Authentification failed. Database is not joinable.');
    if (results.length != 1) return reject('Invalid licence key');
    else {
      const user = results[0].user;
      const databaseMachineId = results[0].machineId;
      const localMachineId = await machineId();

      if(databaseMachineId==='') await updateMachineId(key, localMachineId);
    
      else if(databaseMachineId!==localMachineId) return reject('Wrong machine, open a ticket for more informations');

      updateLastConnexionDate(key);
      await resolve(user);
    }
  })
  connection.query(updateQuery, (error) => { if (error) return; })
  connection.end()
}

module.exports = {
  authUser,
}
