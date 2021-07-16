const fs = require('fs')
const csv = require('csv-parser')

async function csvRead() {
    var dataTab = [];
    await new Promise(function (resolve) {
        fs.createReadStream('./KithEU/email.csv')
            .pipe(csv())
            .on('data', async (data) => {
                if (data !== undefined) dataTab.push(data);
            }
            )
            .on('end', async () => { resolve(); });
    })
    return dataTab;
}
async function csvReadS() {
    var dataTab = [];
    await new Promise(function (resolve) {
        fs.createReadStream('./KithEU/succes.csv')
            .pipe(csv())
            .on('data', async (data) => {
                if (data !== undefined) dataTab.push(data);
            }
            )
            .on('end', async () => { resolve(); });
    })
    return dataTab;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

async function main() {
    const data = await csvRead()
    const suc = await csvReadS()
    var test
    var arrayData = []
    data.forEach(e => {
        test = false
        suc.forEach(e2 => {
            if (e2.Email === e.Email) {
                test = true;
            }
        })
        if (!test) arrayData.push(e.Email)
    })
    mess = 'Email\n'
    arrayData.forEach(e => {
        mess+=e+'\n'
    })
    console.log(mess)
    //const unique = arrayData.filter(onlyUnique)

    //console.log(arrayData.length)
    //console.log(unique.length)
}

main()