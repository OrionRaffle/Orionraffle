const axios = require('axios-https-proxy-fix');

const courirEqlUrl = 'https://www.sneakql.com/page-data/fr-FR/launch/courir/'

async function getRaffleDataCourirEql(raffleId) {
    try {
        const request = await axios({
            timeout: 10000,
            method: 'get',
            url: `${courirEqlUrl}${raffleId}/page-data.json`,
        });
        return request.data.result.data.prismicDraw.data;
    } catch (err) {
        return undefined;
    }
}

module.exports = {
    getRaffleDataCourirEql
}