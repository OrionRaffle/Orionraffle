const path = require('path')
const mysql = require('mysql')
//Config
const { host, user, password, database } = require('../../config/config')


async function getRaffle(callback) {
    const connection = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: database,
    })
    connection.connect()
    const query = `SELECT idRaffle from website where website="courir"`;

    connection.query(query, (error, results) => {
        if (error) throw error;
        var res = [];
        results.forEach(element => {
            res.push({
                id:element.idRaffle
            })
        });
        callback(res);
    })
    connection.end()
}

module.exports = {
    getRaffle
}