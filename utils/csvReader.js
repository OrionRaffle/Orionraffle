/* eslint-disable no-undef */
const csv = require('csv-parser')
const fs = require('fs')
const figlet = require('figlet')
const chalk = require('chalk')
const clear = require('console-clear')
const readline = require('readline')

function pad(num) {
    return ("0" + num).slice(-2);
}
async function date() {

    const date_ob = new Date();
    var seconds = date_ob.getSeconds();
    var minutes = date_ob.getMinutes();
    var hour = date_ob.getHours();

    // prints date & time in YYYY-MM-DD format
    return `${pad(hour)}:${pad(minutes)}:${pad(seconds)}`

}

clear()
console.log(
    chalk.rgb(
        247,
        158,
        2
    )(figlet.textSync(' Orion', {
        font: 'Larry 3D',
        horizontalLayout: 'fitted'
    }))
)
const setTitle = require('node-bash-title')
const { resolve } = require('path')

setTitle('OrionRaffle | Private Beta | V.0.3.6')

try {
    if (!fs.existsSync('SNS')) {
        fs.mkdirSync('SNS')
    }
} catch (err) {}
try {
    if (!fs.existsSync('Courir')) {
        fs.mkdirSync('Courir')
    }
} catch (err) {}
try {
    if (!fs.existsSync('Footshop')) {
        fs.mkdirSync('Footshop')
    }
} catch (err) {}
try {
    if (!fs.existsSync('CourirInstore')) {
        fs.mkdirSync('CourirInstore')
    }
} catch (err) {}
try {
    if (!fs.existsSync('ShuzuLab')) {
        fs.mkdirSync('ShuzuLab');
    }
} catch (err) {}
try {
    if (!fs.existsSync('./Footshop/raffle.csv')) {
        fs.writeFileSync(
            './Footshop/raffle.csv',
            'Email,FirstName,LastName,Country,Address,PostalCode,City,CardNumber,MM,YYYY,CVC'
        )
    }
} catch (err) {}

try {
    if (!fs.existsSync('./SNS/raffle.csv')) {
        fs.writeFileSync('./SNS/raffle.csv', 'Email,Password,ReDraw,CustomProxy')
    }
} catch (err) {}
try {
    if (!fs.existsSync('./Courir/register.csv')) {
        fs.writeFileSync(
            './Courir/register.csv',
            'Email,Password,FirstName,LastName,Country,Address,Address2,PostalCode,City,State,CardNumber,MM,YY,CVC'
        )
    }
} catch (err) {}
try {
    if (!fs.existsSync('./Courir/login.csv')) {
        fs.writeFileSync(
            './Courir/login.csv',
            'Email,Password,FirstName,LastName,Country,Address,Address2,PostalCode,City,State,CardNumber,MM,YY,CVC'
        )
    }
} catch (err) {}

try {
    if (!fs.existsSync('./ShuzuLab/raffle.csv')) {
        fs.writeFileSync('./ShuzuLab/raffle.csv', 'Email,Password,FirstName,LastName');
    }
} catch (err) {}

try {
    if (!fs.existsSync('./SNS/update.csv')) {
        fs.writeFileSync(
            './SNS/update.csv',
            'Email,Password,FirstName,LastName,Country,Address,Address2,PostalCode,City,CardNumber,MM,YYYY,CVC,AddAddress,AddNumber,AddCC'
        )
    }
} catch (err) {}

try {
    if (!fs.existsSync('./proxy.txt')) {
        fs.writeFileSync('./proxy.txt', '')
    }
} catch (err) {}

try {
    if (!fs.existsSync('./config.csv')) {
        fs.writeFileSync(
            './config.csv',
            'LicenceKey,webhook,SMSActivateAPI,Key2Captcha'
        )
        fs.appendFileSync('./config.csv', '\n,,')
    }
} catch (err) {}

try {
    if (!fs.existsSync('./CourirInstore/raffle.csv')) {
        fs.writeFileSync('./CourirInstore/raffle.csv', 'idShop,idCard,Country,DD,MM,YYYY')
    }
} catch (err) {}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function csvReadClientAuth(callback) {
    const promise = new Promise(async function(resolve) {
        fs.createReadStream('./config.csv')
            .pipe(csv())
            .on('data', async (data) => {
                await callback(data);
                resolve();
            });
    });
    await promise;
}

async function csvconfigreaderShuzu() {
    var configcsv = []
    fs.createReadStream('./ShuzuLab/raffle.csv')
        .pipe(csv())
        .on('data', (data) => configcsv.push(data))
        .on('end', () => {})
    await sleep(1000)
    return configcsv
}

async function csvupdatereaderSNS() {
    const updatecsv = []

    fs.createReadStream('./SNS/update.csv')
        .pipe(csv())
        .on('data', (data) => updatecsv.push(data))
        .on('end', () => {})
    await sleep(2000)

    return updatecsv
}

async function csvReadProxy(callback) {
    let proxies = [];
    const proxyLines = fs.readFileSync('./proxy.txt').toString().split("\n");
    for(lines in proxyLines) {
        let data = proxyLines[lines].split(':')
        if(data[0]==='') continue;
        proxies.push(
            {
                ip: data[0],
                port: data[1],
                user: data[2],
                password: data[3],
            }
        );
    }
    await callback(proxies);
}

async function csvrafflereaderSNS() {
    const rafflecsv = []

    fs.createReadStream('./SNS/raffle.csv')
        .pipe(csv())
        .on('data', (data) => rafflecsv.push(data))
        .on('end', () => {})
    await sleep(2000)

    return rafflecsv
}

async function csvRegisterCourir(raffle, tabSize, timeFrom, timeTo, callback) {
    let proxies = [];
    const proxyLines = fs.readFileSync('./proxy.txt').toString().split("\n");
    for(lines in proxyLines) {
        let data = proxyLines[lines].split(':')
        if(data[0]==='') continue;
        proxies.push(
            {
                ip: data[0],
                port: data[1],
                user: data[2],
                password: data[3],
            }
        );
    }
    await callback(proxies);


    var dataTab = [];
    await new Promise(function(resolve) {
        fs.createReadStream('./Courir/register.csv')
            .pipe(csv())
            .on('data', (data)=>{ if(data.Email!==undefined) dataTab.push(data); })
            .on('end', async () => { await callback(raffle, tabSize, timeFrom, timeTo, dataTab);});
    })
}

async function csvloginreaderCourir() {
    const logincsv = []

    fs.createReadStream('./Courir/login.csv')
        .pipe(csv())
        .on('data', (data) => logincsv.push(data))
        .on('end', () => {})

    await sleep(2000)
    return logincsv
}

async function csvrafflereaderFootshop() {
    const rafflecsv = []

    fs.createReadStream('./Footshop/raffle.csv')
        .pipe(csv())
        .on('data', (data) => rafflecsv.push(data))
        .on('end', () => {})
    await sleep(2000)

    return rafflecsv
}

async function csvrafflereaderCourirInstore() {
    const rafflecsv = []

    fs.createReadStream('./CourirInstore/raffle.csv')
        .pipe(csv())
        .on('data', (data) => rafflecsv.push(data))
        .on('end', () => {})
    await sleep(2000)

    return rafflecsv
}


function formattedDate(d = new Date) {
    let month = String(d.getMonth() + 1);
    let day = String(d.getDate());
    const year = String(d.getFullYear());

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return `${day}/${month}/${year}`;
}

async function csvRegisterCourirLog(info) {
    try {
        if (!fs.existsSync('./Courir/log.csv')) {
            fs.writeFileSync('./Courir/log.csv', 'Mode,Date,Time,Email,Password,FirstName,LastName,Country,Address,Address2,PostalCode,City,State,CardNumber,MM,YY,CVC')
        }
    } catch (err) {}
    a = await date()
    fs.appendFileSync('./Courir/log.csv', `\nregister,${formattedDate()},${a},${info.Email},${info.Password},${info.FirstName},${info.LastName},${info.Country},${info.Address},${info.Address2},${info.PostalCode},${info.City},${info.State},${info.CardNumber},${info.MM},${info.YY},${info.CVC}`)
}
async function csvLoginCourirLog(info) {
    try {
        if (!fs.existsSync('./Courir/log.csv')) {
            fs.writeFileSync('./Courir/log.csv', 'Mode,Date,Time,Email,Password,FirstName,LastName,Country,Address,Address2,PostalCode,City,State,CardNumber,MM,YY,CVC')
        }
    } catch (err) {}
    a = await date()
    fs.appendFileSync('./Courir/log.csv', `\nlogin,${formattedDate()},${a},${info.Email},${info.Password},${info.FirstName},${info.LastName},${info.Country},${info.Address},${info.Address2},${info.PostalCode},${info.City},${info.State},${info.CardNumber},${info.MM},${info.YY},${info.CVC}`)
}

async function csvCourirInstoreLog(info) {
    try {
        if (!fs.existsSync('./CourirInstore/log.csv')) {
            fs.writeFileSync('./CourirInstore/log.csv', 'Date,Shop,idCard,Country')
        }
    } catch (err) {}
    fs.appendFileSync('./CourirInstore/log.csv', `\n${formattedDate()},${info.name},${info.idCard},${info.Country}`)
}
module.exports = {
    csvReadClientAuth,
    csvconfigreaderShuzu,
    csvReadProxy,
    csvrafflereaderSNS,
    csvupdatereaderSNS,
    csvrafflereaderFootshop,
    csvRegisterCourir,
    csvloginreaderCourir,
    csvRegisterCourirLog,
    csvLoginCourirLog,
    csvrafflereaderCourirInstore,
    csvCourirInstoreLog
}