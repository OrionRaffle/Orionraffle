
const axios = require('axios-https-proxy-fix');
const { csvproxyreader } = require('../../../init');
const { sleep } = require('../../../utils/utils');
const fs = require('fs')

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const proxyConfig = {
    host: '127.0.0.1',
    port: '8888'
}


async function csvReadHeader() {
    
    let headers = fs.readFileSync('./shapeHeader.txt').toString()
    headers = "[" + headers + "]"
    headerTab = JSON.parse(headers)
    return headerTab
}




const checkMail = async (proxy, email, headerTab) => {

    proxyconfig = {
        host: proxy.ip,
        port: proxy.port,
        auth: {
            username: proxy.user,
            password: proxy.password,
        },
    }
    try {
        const resp = await axios({
            headers: {
                'content-type': 'application/json',
                'accept': '*/*',
                'exj5wzxnuf-a': 'gDpbG5ojg97qX_qmcbtoTMqC3nfilaYlh0CcG_Zz-Yo4WIgqChePoW3_TO53prKrWO1SSp6iwnrb0cOfIRw2IyIf2n8Xy3viW9VGFHrnwzX1DTYgnOg-6ehE1jkJtF1=o0PSPcj45umPRHdljZZvIS8x1hlieEECCPCxxjaB-oh_fYMCWxPL5gm8DZ2HH=cWFZsNGVR=0YkbMzL-EtpxPeYuV-7=-yytXOf6UTCewcpYbRHvAJwRwzV3fqw_BAwClY95NLrwDWOJyllzBCBJ1FqkVRIUy0PO5_oRVWGKL_gxpBq62Yv3uA_gKddaHrny4JDL-o6s3Jxf=YoFrvuxAg0=FyXyYSaZ-c2S2vdqalq5NOPPa3B2M36=k3tSNoU=m3l9YmAWqprcZqiiILEENki9UFD5KrTwSLEgg6UKqcADMDTpq-IxIcFd_7tvdI9ISY7WsPzyoOI6LpFlyNrgVrUIDhsd4pRxqIZk3L86iZO53HiIELmpIGC9o5LzU_06oIKF714czCcxH6tuZ8sUY9lOsrYhGi-Yi=UeWZJFckiJifY88X7clJycJHYhR0n0=BBWdOBCDbDqPYDVAKlZ4NMXv=iBghNpxP7Er-4WpFlTB7d36077GKYM1IGnSN1_N061w9mMp0MNsoaqsBO9_C1ub6PGFSn7wFebqsLqx5kT5=cfFAFM283=s_JvnOFharjSHCr__uOsP_YdZv89d-872pdXSU4LSoolRyX1UkiO64nw=uPRxI=nYE0bZP_m9H1k-Es7krfvf16HC1Vm-5dopk1Rfo7FDVZX9iVkjeozrDmu5v_M8_fuM5pnTv_B6vr=E3VR7G87czTio1vjzwG8IAV6m2OxuucDFcYrzqeakf07mJ9AK-cH-cI_ekoXOjkc-PWvvZlG0kXY64Dx==lLpSJ8npf2z94zsNDa4Scxu29uXCBsSmPRj8urYqV7HheAb_TMURM6TVea2YXh5U4=zvlY18Gs-wsbIyjF0vP-ohcKNAw7teEu31Vdgv0rJYfCzZm1P5iJhgby2nLuxWF9HSzDYjbHAZVn_kFD4KvyakuNjIhqTLfVba4y5tVcwXddXD29CXwVxT6yHkWa4SX2rPjsO3mKS1yomP5PA6i_5j-SDYuP80gt7kXOxLZMssp1Mud8yOmONM9=M2FfNX_8DV43vXfgBO9uNFLv7Odwd2JjoW2MP_=VU=76utI99y7w66_j4T4fvGuMmLKRctFxeIhDPe3-L7elbqwqLMfjP3oLAhoe2dWuEwegidmDqiX0JnWk9P8aazGa8FoyB3O-vynOLG3b51qHvfhow5JujezbP-uYm-0iABxMn2d8ubOox5kZZyaXfFnjsW4VE=Ryvqsp1RPDWXE9VY1LZy6b8ssOi28w2qssWvRR-I5BpCT1b6C-ZcZZ9dr_CDHaAljH8nzb2yX77wR9ji1MbWMq8N-GGbXFpVOiCx=6XRHAn215KhlFiTXbowO=AfvTx63KRbqViYWsMr02kbIw2-lw1laD_N6OW2iFr2cY-2NsiPNUiZiAVkP189Vmxr-iw87m3XIf9C=Nz=HFsh3-Kj9PmFe29SYjJBrLTH_eNA=P7hfAZzACLdiyr-AyfxIpdmcgRP2D2_C5o2PtCItnBTn-xI9u9TlU=_a4yzLbkzZO_HcFsnu6DVLupfLUTLaqkjoFos6MKkS0KErg=WvVGZ9MnArSqoZjVT84yfgP9kCji9vJlj5bHFEpP6jp-3nLe703pAVnY4Jn2NfEKOOCka-nq0E7HOjc=a11yA9ZvscngM7M_fpzmG3MXzavYuPI_uj0YDfueb3GnRDEoP5UsHhJwE6AG6RbhcWUqeP_Yf=2KhZBEJiNkiRFet0U=UY7XdA2_PZYK4R8-uHaMFu0HZHtPok2CYMOWyEj6Ax4uzzBjw0YOhEXatMUrgn0gpTW5f4VRWnMjltMY8InVPO1k4csjG=SqGUhwoKVGfoPoX7a9PHHC1YagJ6DlahnY0g4Jr6TLYx0fsKdBSKP8ySXE=saD9h=U4vKOpfx6fm-BEVU8uBbi0IuzI7_k6sfi0U=MvC-nyewrZJdtZYMY_j=I3qq3ZJc5dSnEBb45fvcnC6zVpZ54pKXgcz4qkiUSB95SKYSsZ1=BYgAAH5METu_0HMux8ihUytzK9loe7G9r25dES9tMMeuALLeiFo1PNnkOVj9VUtKdlrFVmxZ0kd5vk6ZHRNnLdtMaoqBx9TGazOErx3VnwnZS69N5Cl6j7ro4x2Ur7c4PFzsIZ1GGO84oC1fDWUK5sMtPh4=oAYK_0ZhZ-p07snkll0b0VXfTAFPEYs45SsH=jeC0UwP66EpG7FeL1TtCLwU5x4Rgjjdcdq_pk9Z_nNHeItlPeoO2fmETA6jzMWZSjFSaW86An_43w9GgvfmFrUadp43MfHKJMbZck97_yTLqNa5wkig02L_VbsZS=48fsx9DYwCrhW7_RcdEK-jT25srKzH9jJPY=FSx8yTYu8PYd72aLXeXyyjJ30HD0PzB0dqrGwqnFuVzBUx=2EuOIzaw7r-Z6DUwjx6OHf0B_FIB=wxLZFyoZ0=I18pfPSbcdXjmaSbRGngyWqx7fdqxxqA=0mRtWD9eDUS9rUT8ma9aksjfnbPai7f4KO97rzbC9a1T2Nu4rHsZ=koIoVSlDlmPnwM5KcKoiSWHVY69weM81Lgr9Om90nH7TEaE32HDvaA8EnxeIpMz2EbPhqUn4rJCmVFwzwqL3_aG8tRWZSvFGoxz75pYaGoMt-7LbhzXMG3ys9FjSvoONFr4hj8t0H9Hs=bFm7o351VRiR_MWxkrAM6LUOX1MeJxXI7WKuF5oYbiWPKenqySkjqrcIUW5-By3RIwWEgiBFHDGPzWeb1yLBscnDa0O9nUomoRzLNfkprMETEgPV1dKszAtC-9sRa2dMUvIiXx55PGT9XjRAtzT=7wR2seK1elWLh5=ZSME69hkpYhri1A39dgxVvWfXRZtZeR5uHGr=3iWXYzjVte6OSt6WVWCrPjgYuH_tfg-PxaIN1Guj0wDNdGsOy86k5G3WaahcyvXh1JLLAAkLE=oyVY8TO1ViplTD6svPJHa20YjRqt01fqYJj9btLxiFbSLNGFTyOVvA_4tS4GH=aiv9fAwTz4hngtNBnk4SjV7rYHkqJoXh-ldimMAxgwp2AdyDXR0b4fbhbjOlO60olcZjR1TY197OdD=X106LejfArgmD8CCg4FNzsBcTFx8c46jGwwCFGngnlJh5LZ9LN_KfCJXbHkIiwYkr1s0a3wuJao3FVZ3bzz5eqPRU55G-o5yJVXACrP-H9jbsKbd3bEIiqKY8qu4u2HtshFSEUSh6buAfUjseUTM9JLDclV-UDYAgDB=vYc-dWKawssa87Hbt5OkSC0saKIFfLnGWwjpuJyYgnd5uOByUAIaRSIP_IqxHPFLCjlB1TiIvViRRMNywvYPkEbT51yqqB7g8BrrC-5InFlVJTA-43DCvXfUS4Te1tVqurn3W1sufPaCT2tFEMWtN5WKb8w2SZr=CCRWTR61kG7TIxc50PFnq3LYz9Op-4IuT_wOZCE=s72wmks1H8o6UqV8qaa4RGdJKgVVG3TSySgD9C=SDdZX1Td2L61GYlYZjI2T0fKl735tcqjscFkX9jhmWiX2-z_SFU3fKoH8cvaLYD8pFVMuqnuss8m3YaiyFowVfTEe4WRaGFY8=fB8dySE8Ra3w1koYxFdgHG-s5m1gEuOk_5pDHWHAwT8_hLVWv1YYTBLIzyqz1rVIYv5AIk484q=7uqRpJsOSI2h-RS_7lXubjJn4LGPgfF3qhZk-DPcVmExOp9ihD=AlOdkrA8J_DD28dbujBns9lMblLjhetTJ7pD0ROUSmE85DAFGjIJDJVc1kMIctDRzUH98HZNTNCW8rF-xBPgfDMvwJSJx8FTELDKcI34az8L-G2zNBDRJZrlxhaS--hu5=VAe2HtmuuhBa4RnkNCavenwAiRPZ7gPZ8C0wJAmJrzmd8KR6lIvHjwJIRsl0_aCT-jjupPyN49VhHcDc-4hVk7wuWPKBcCXgviik_b8wcGyJzsfpzVz5JXLkgqJ14ka-nCfHd8R-fTCCjaUD-Nr-FLn=Y1lVzuXwWKWoO=WdNA9LUvKIitZkIxT3qsXFs7auLylvaXWFbIwYx1rfZfTsW12VJajfUj3S4-tlK2aJ0MkZM9DnynWnRA-xePeZ2b7HPpihj-JqaDmzLCa4BnLpffORN8IzsqzNfC8TM48WStdaaMfYUpI61OaWsGTiufx8mR1cr1hZAxt1ZdieYpKvMK7w5Kk1420kj2vB6sxYOySbbzi8qaepnE01lLLAVu1W1nhEnX0X1=tu-AqTTc0-EGM-gNcI_Pq8Tq69oNg3nFJfJx1S3Xrop4UwjxMYvJAPAcI-6TI-VfOzc7rVf9knHGXjmUjXHqMEnxP98U9k5UscEtNlBq4LpBdkqvsRVP5kjuEBYWzxzR962HcFrbTzwisIj2IriR7_n2w2ahF1DtO1cMACWCdF34xEfyRz=RgXxdVtFLiR-Mvu0=F7d06O1nPz22GP2CCYi3w6tVeKY4If2cJ2jSjtEWPENnlZG_pytJjIEJaJ5vIgR6C3MnXTR2E6=dRX00KAkfKj2ZP7PcyISC9xg1qSS=_BoeKoWWWzFoxaxhagfxjS0Yr5M0Rv=PG9jNKFf8HZPU5dyTjj0IXOgBcAZKwl83pfjWoHDsklJE=27zcIB-MRq_4pgHRSPCn-Z6iO_pjoU80=2AgVH32-GXICFWpnRWbG07b7NYG=TyHoFywYkBC64XH7_-SmXUXk=LOeqC1NbwuVKD8OgMjTLqEo27o7pxWOcVs-f3dOmXGT3FiB9ox713muAANvGBTDs-bnvHS1CrO0CoxbmxGkSS5=L56BAeAmBRV_VZ6UAi6n5Fwxr2HXECy1u-pJredmfKpgGnI5rEP7sJoKlXXntWmZaTuP4RgPXrlKBDb-F72GjYzq_tR6mlcceCINguwdluLAm3NHE7FcSPCs9q5IXUDYOXrsthAG0Bz51JnlrrNOR0p6UqCKoAd5PCDE-DjqPsKgws=xRpMdbX_6eZBnR0bwVeCJA5t3OOcavmnuMoeFYGKPPPGE0iSmyFNGwJT265a8IUPZVwiCcFI8pSm1jTCob_tUoGedcUagF2gFeaJVOwNt_ySXyoTHHB9v20jTtUA8bhe4dBtHUrxH-KMkV7k7nIJ9FZNPh1rpbvIbIHeHz5MziUU2SVXHIlzPZmc=r3sbtL2S4CHeG3ySC4VmBP_qDKXGtoyvuYgWneZw9YH29qC3mi82YeIyjFRiTO9IrFKMIEn4U1_LVOKLL0dE910jmw2U7P2S=ugoDx=37ra24AN=RgB7fbXz2-Y5u45kZMlgkUZlc_ajTSdmh2uncpmo7wc8I89i3Sj7O9f1_6C_v5N-iC3HbcLKucGqMX0XGzEmE2VRJvhqReAlf7OKAhJoIRJWS8lSEazPX2AwbVok1M4ywCjdELmMy4x4tEEysTv_AUM_Yl71GNb1RT4Nur0vF_pRMpLuf9Dc=V-R2ie1RIVaeArPM1Y6ikwvI0_nNWYa-LLOaCG2AkqGbpP8mclk4=1_eDtGLhSH8e=S0jI4PViLsxztN4i4gBdhWwLKXHE1lJvkzA8UPErzb9_SoEDJLRqYdrzj01PlE6FbS6moSUB_Sq3_bMg5u7bsacgXUm0MpspUv6bHpDFkGzTNgeXAAA11EPlT-WkBMvb-a4J_9fZ2O=gK0wgCcvwwhLKil64GYIdb18GXJeo0xzMd7-Zd32G_NeE9ZdrPgqdNJBjIt0a86iXNYmPfy-08V7bHHd4_0be5M2KAlwAKsPIADU5_tEFnR9uC0BFlZuiNJ1onDV8r5Vsey3LL7keRmrCilOFcCEFB7UsgZGKTF5CPiWM1oO8rd8GgemjdwZxwI6nZNFv0h9h-OwMNr-XVS1Sofj_cyUIIvuDCbT7daz8u9KPkqPUIcETPsd-PaHkTkcxCKE-tPjMOSw2avA6_5RmhRqu5yete7R2ypV03SLy3oLO3UUbbziJ5GT6r8vPhMThY2K=ZjvLJLgf=wIg6T5ODZU7Ru2ZHTjnibIdb=B_PwV1=rJLDUhUUPnJuMDSssucznWsct4tpKx36s9n3veVcNY4pgeKyDEOwnR6zntjNo5EAjT=7fsC1koME8uf4UZhsaIho44JINADC04TIcmtzd5HIJlpdyNGi7CwbInaJwb-0XNWbbS7-EL4csvv4=BPSz1aP2Kg_cqHYqYsylFSIkdytHZF6pM_fzg0nWfDfl=hKTtNmnVX98LGqDZJ5tRdUmzpsSFq_jPAbHGr186iL44q8UAFBmZyFZ4D4sYIXIwRz0b1aCYCFmFWbiSp4PyR0fJqOqzFppduYv2sOfl88rqlG3BqumogE7gPMzb0GykZ8Ouyay=_tSa0jHV5pCSi=h4MKFgqjHFM7KS4x_CnHT5mZtTAtZobILMecVgdpcI0uRZbEJmj8t2LA',
                'exj5wzxnuf-b': '-a7xk51',
                'accept-language': 'fr-fr',
                'exj5wzxnuf-c': 'AMBHWxF7AQAAML_tPj-H10epYpemPqM0_fWb3b0SWd37GiZH6ZgsepPcJxEJ',
                'exj5wzxnuf-z': 'q',
                'accept-encoding': 'gzip, deflate, br',
                'exj5wzxnuf-d': 'ABaChIjBDKGNgUGAQZIQhISi0eIApJmBDgCYLHqT3CcRCQAAAAAOK2yhALRmvh_Vj_NaNl19_7xcRsA',
                'exj5wzxnuf-f': 'AyIKYRF7AQAA1HbREtFx2zte8xVn633yAuGVPVY_WTjJ5lfLXOu_PTN9cMiTAaFNWjWuchAEwH8AAEB3AAAAAA==',
            },
            method: 'POST',
            timeout: 10000,
            url: 'https://api2.endclothing.com/en-fr/rest/V1/integration/customer/token',
            data: {
                "username": email,
                "password": "yodlo!Jfh"
            },
            proxy: proxyConfig,
        })

        console.log(resp.data)
        return resp.data
    } catch (err) {
        console.log(err)
        if (err.errno == 'ENOTFOUND') {
            console.log(colors.brightRed(`[Error] Proxy error`))
            return -1
        }
        if (err.errno == 'ECONNREFUSED') {
            console.log(colors.brightRed(`[Error] Proxy error`))
            return -1
        }
        if (err.code == 'ECONNRESET') {
            console.log(colors.brightRed(`[Error] Proxy error`))
            return -1
        }

        if (err.errno == 'ENOENT') {
            console.log(colors.brightRed(`[Error] Proxy error`))
            return -1
        }

        if (err.code == 'ERR_SOCKET_CLOSED') {
            console.log(
                colors.brightRed(`[Error] Proxy does not exist`)
            )
            return -1
        }
        try {
            if (err.response.status == '416') {
                console.log(err.response.message)
                return -2
            }
        } catch (e) { }

        return -1
    }

}
const getData = async (proxy, token, headerTab) => {
    proxyconfig = {
        host: proxy.ip,
        port: proxy.port,
        auth: {
            username: proxy.user,
            password: proxy.password,
        },
    }
    try {
        const resp = await axios({
            headers: {
                'content-type': 'application/json',
                'accept': '*/*',
                'exj5wzxnuf-a': headerTab['exj5wzxnuf-a'],
                'exj5wzxnuf-b': headerTab['exj5wzxnuf-b'],
                'accept-language': 'fr-fr',
                'exj5wzxnuf-c': headerTab['exj5wzxnuf-c'],
                'exj5wzxnuf-z': 'q',
                'accept-encoding': 'gzip, deflate, br',
                'exj5wzxnuf-d': headerTab['exj5wzxnuf-d'],
                'exj5wzxnuf-f': headerTab['exj5wzxnuf-f'],
            },
            method: 'GET',
            timeout: 10000,
            url: 'https://api2.endclothing.com/en-fr/rest/V1/customers/me',
            proxy: proxyConfig,
        })

        console.log(resp.data)
        return resp.data
    } catch (err) {

        if (err.errno == 'ENOTFOUND') {
            console.log(colors.brightRed(`[Error] Proxy error`))
            return -1
        }
        if (err.errno == 'ECONNREFUSED') {
            console.log(colors.brightRed(`[Error] Proxy error`))
            return -1
        }
        if (err.code == 'ECONNRESET') {
            console.log(colors.brightRed(`[Error] Proxy error`))
            return -1
        }

        if (err.errno == 'ENOENT') {
            console.log(colors.brightRed(`[Error] Proxy error`))
            return -1
        }

        if (err.code == 'ERR_SOCKET_CLOSED') {
            console.log(
                colors.brightRed(`[Error] Proxy does not exist`)
            )
            return -1
        }
        try {
            if (err.response.status == '416') {
                console.log(err.response.message)
                return -2
            }
        } catch (e) { }

        return -1
    }

}


const addAddress = async (proxy, token, data) => {
    proxyconfig = {
        host: proxy.ip,
        port: proxy.port,
        auth: {
            username: proxy.user,
            password: proxy.password,
        },
    }
    try {
        const resp = await axios({
            headers: {
                'content-type': 'application/json',
                'accept': '*/*',
                'accept-language': 'fr-fr',
                'accept-encoding': 'gzip, deflate, br',
                'user-agent': 'END/871 CFNetwork/1206 Darwin/20.1.0',
                'authorization': 'Bearer ' + token
            },
            method: 'PUT',
            timeout: 10000,
            url: 'https://api2.endclothing.com/en-fr/rest/V1/customers/me',
            data: {
                "customer": {
                    "id": data.id,
                    "extension_attributes": {
                        "is_admin": false,
                        "storecredit_balance": 0
                    },
                    "addresses": [{
                        "street": ["Mickey Mouse Land 56"],
                        "city": "Fomoran",
                        "region": {},
                        "lastname": data.lastname,
                        "postcode": "53000",
                        "firstname": data.firstname,
                        "telephone": "0613154545",
                        "country_id": "FR",
                        "default_shipping": true
                    }],
                    "lastname": data.lastname,
                    "created_at": data.created_at,
                    "website_id": data.website_id,
                    "firstname": "Mifckey",
                    "custom_attributes": [{
                        "value": "0",
                        "attribute_code": "marketing_opt_in"
                    }, {
                        "value": "3",
                        "attribute_code": "account_origin"
                    }, {
                        "value": "1",
                        "attribute_code": "group"
                    }],
                    "group_id": data.group_id,
                    "store_id": data.store_id,
                    "email": data.email,
                    "created_in": data.created_in
                }
            },
            proxy: proxyConfig,
        })

        console.log(resp.data)
        return resp.data
    } catch (err) {
        console.log(err.response)
        if (err.errno == 'ENOTFOUND') {
            console.log(colors.brightRed(`[Error] Proxy error`))
            return -1
        }
        if (err.errno == 'ECONNREFUSED') {
            console.log(colors.brightRed(`[Error] Proxy error`))
            return -1
        }
        if (err.code == 'ECONNRESET') {
            console.log(colors.brightRed(`[Error] Proxy error`))
            return -1
        }

        if (err.errno == 'ENOENT') {
            console.log(colors.brightRed(`[Error] Proxy error`))
            return -1
        }

        if (err.code == 'ERR_SOCKET_CLOSED') {
            console.log(
                colors.brightRed(`[Error] Proxy does not exist`)
            )
            return -1
        }
        try {
            if (err.response.status == '416') {
                console.log(err.response.message)
                return -2
            }
        } catch (e) { }

        return -1
    }

}


async function main() {
    headerTab = await csvReadHeader()
   

    proxyTab = await csvproxyreader()

    emailList = [

        'pierre-josephknepper1728@outlook.com',
        'rewanmalpezzi6705@outlook.com',
        'savannaplaterrier9157@outlook.com'
    ]
    headerNum = 0
    for (i in emailList) {
        token = await checkMail(proxyTab[0], emailList[i], headerTab[headerNum])
        while (token == -2 || token == -1) {
            headerNum++
            await sleep(20000)
            token = await checkMail(proxyTab[0], emailList[i], headerTab[headerNum])
        }
        console.log(token)
        await sleep(2000)
        data = await getData(proxyTab[0], token, headerTab[headerNum])
        while (data == -2) {
            headerNum++
            await sleep(2000)
            data = await getData(proxyTab[0], token, headerTab[headerNum])
        }
        await sleep(2000)
        error = await addAddress(proxyTab[0], token, data)


    }

}
main()