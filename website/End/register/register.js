
const axios = require('axios-https-proxy-fix');
const { magentaBright } = require('chalk');

const colors = require('colors')
const qs = require('qs')

const { csvproxyreader } = require('../../../init')

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const proxyConfig = {
    host: '127.0.0.1',
    port: '8888'
}


headerTab = [{
    'yyvzcfzh4c-a': '3uO4IyWeviLLU5MfTOfF1=oK_ut0yaSSgheUtSr4NK8HjL12RkUsgOAN8-dTd7szNVVDGXZ04omWijmoyCsHjzT=Dfw9Lc=R335xVD4YJVAhTqd9RPfeGK4yDkJ5BEgq=a2TLJKHr2eRMJ5ZzSzSfvb=pkIzv1JDh_c84yJviWK0Tlful6LNrOUXeTxMdob8FS=KJUaDrVMEZl6W96SZTB8Ta7uyNiYqPNhE4mvc6qTYdfxEcUD13hY5GZ=-1k7CUDuYDIUqR1Cl-1ZcmKe8EmIKnb9aUytY7iEa96ssi6GCNKgRb4ssb4mNPT3a-Hf85q4==x8eHjPia2s8rMrI3x4P9XMFL5IqfpFVmm0h75hZTALVul9GWJvgx4DrP0u5dxBLyYIyUTGP7Z0Ug-7oJ=70Gj544V9jR8WgMN1WbsMbXIwButLpRsHd4mBasChKHLA_nl18Y2F8=k0bBF4kltmzaZLl6NVzVCmWgWclJNdHIGO8g3sdxElRyR6JFNUiLkNtv6Y7J7Ip2MCENXaKc7xuzIzjxTlYV30v6YK9=DzIDe8WAJXaNa6g8D2PYyLGHnaZ5Yt4RaVYvfzkILbLxq5kkVhAUTg3zmefixuVW2J1tdiK4eWNchAaOZXNNff7IgbzRMf4CyGuP-wJkn_=20_PnvjKBgdh=Dd46CEAw1VMvDM5FKEkXvZy5tu2CX2iTzmj4vou2hTYOJ9tLYVCIZ1u2DwMA6DLq4FI783C3_VChfWPl_GljWWdHKMXXwiZhJgAL5nX_GICXP6zh5SHqraMrqibe2=VyH308Neu4Woe4_vHA3sA96CMKOFlnLZ3TGch_yRTFnf6lXC3CiS_1Fkm9J8k4y=geAbcFr9vqCx7Utew_RdBDsk0dbMbGDj2E-x7bNaDItNcRHyaTMyheUFzNtijundz_Dn8Uq8VLCk2u6iZeqN3fp2kWOI67k2q-EsLx_qMPoZFvA_U45_dvEkDIRA3ZD6KZ8_Er6IHVacwR6V7ncnX88=weSF3O6tTOuKZbT3WETTqcZ3qPXCBdEUpUZgx66M0p0fM3OGYHE_Y1VhjTu1MPfCA-zin913Pshd9CDivj1sXBrY95SiyTDvkcbU5DTsA4eK_CeDZkn2VNV7iAyYVeS=hVGMihyRhv4abnZVgiux0VWk319LKSltk9NyXHocifbaFTznsB85MMyU9CG2AVX8XBjTVwZVFwM8azw_HGt7jgLqLg0POG6xu4Ow3_Pt1blUvENkF4Syw2jXKRt08M=EcXV1yKX2dqp35iu6n34viRka_eE2q=n0iz=bYP793dv=PDuwhxGrfnBgipXkEy_HkFjcXmvNYoW2IUnDLYeSiSr4VWGjER9yiI-7Y4eUuVA_xy4PHXo44M-EAOjdM2UN3Gv5XUsYwi6RdPDsZ1wxeklTUWGSebnwnBv_I5lKUIZjbhRTMth0_WrmNKTo7Armtn7qpogYJZNmTo5uaJnRJ5w8Brew6hY6hj5fziTvDurdT31XhN5uwLAbApz9vnya8KWZhsllth1zCdY5JahnK9=mTgXOYxqoA7c0p8PRJ=VSb7a-uBtedlBgtrSX7h0xVZ0MwnPDjFhGTWH8o9mtONoSFc_MdE_aHu33kkZjpsRpzYFFxHylAsjwnoi',
    'yyvzcfzh4c-b': 'vrty1',
    'yyvzcfzh4c-c': 'AKCTDfd6AQAA0IJrT-DZn9g79aQ2RbB8H3SiN22Mr-U3uHrhvwtisIQarnZP',
    'yyvzcfzh4c-d': 'ABYQoAuAAKgAhgCAAICQwAKIAIEwBAtisIQarnZPAAAAADI2Up8A2wdfK8bPPca--lhS6QyqRA',
    'yyvzcfzh4c-e': 'b;RfYK8uIVpJzx132IljW21nRK9wkY5PJpuf1FmigDtcMmBf1tQo0O0orWOlSWAqhE7dhzmVadL2VJglp9eu56M_pbhcAcBTF3C-JJWB5pjhI8CQs-Q6Y6WuHoyZaITQdLFmJkNFobF2JDqOU7PWAKS4lxB9l4b5SbRTGJ6ImR93CJvFKwbdZv9IarROGPQlZ7rWwbJs-lTSUFzS4kF4ChNVxIvfZJdKhb8VZ_JEOt0Fdes4tsYyIX2icebtkERJQyZrRxfSDUcDvLq7Os3IQLNMpuR7CtoKF7gGMrBp2mEYvtnLw0j1cJl0xr3Rc6fLQkRFx59n6ZKu4JBZuCDJB6g4V93rZaAK1UHTdjFmE50Xyy4INO5yFxw3Qa65zcOoiBft6WOI02uC_mU5_FTrMSxRGaqAUx34-_vVdT5p2oOT8M0M0RXSkJpjXBK_ajRDWzXaj0pIitrrOZjtqsGPEheNCeo1w0oIcVInFt0kDuo5bLXi2NgP3ZnbplLMpElYqbaBRXmCjlTSQQbQ0Kss0PEzkReXBPP1Kkahl9Qxd__LIWCohq6mVyAmbrUZVOUzDrcx70eY1ZgKulQ9CDHz94Z8VkHxQwnrKdXb3paWSwXqA6XHJuwTws6rBXxYNGLfNrv6R1GaDJeHln5oungVgr0Tn8AxiFvK3iRa9tJpgEs8VBOnyxSr3TApvCv9qjh_PwoA2L7csYGbluR0BZD0ocCDpi59Hd5NgPUhPmxHn-h3TG1paBvxTSbmH--yAnVq6xGy7WHqOF4C9rKx0Z_ku94rlgsTiVWTCdDURpYDdyP1qzGPItsn8TWCv0B5dt8zO-ld_qZAnCbG1ReUlADFNEUsmOB-gltySa8mte2OkTv8OnafbJEjFcxIA-Yz-E8tbacdyxkIXzllLcHsBC4x0qa-Ix_ANWyUk9KUinrLmg8aw0zBwXD1o59HNddEYEPMpt7_g=;kRh7HwfNN6pW9phXo_WVdqPS6yZ3fJuz47YAOoxW0as=',
    'yyvzcfzh4c-f':'A5RYD_d6AQAA0UAza9h9QPF_F_g24_9HKjWAJ6lsY_IQHKsnqdu5OheS_wMVAVb0L4tx9oukAAAO8YLqosIO8Q==',
},
{
    'yyvzcfzh4c-a': 'u8J3xPGg5M_0s1RXM-x2NO6IzfPxobCT6xEgH_vgnavxRWjItIi1QGLv72o36gVxfXYbIEttxj=lEvrvi0-UJCq6Bqb3zjepVgxavsUZrua-LesC5zF3cdKE-uyyjCQkl0d3xhQDR8mXGHR02Crn_8jbvy8id3ITUa6JSss0OWio=eYGU==-QYfbNq1F5ADyE8KdHj3SSrmt3FSZF1=g6dzUeqyxrSNH2kp6-uQnXcHKtK=8VdE_h5Cigad8QqtMy6L225Llr-cYzw=1k171e3-oEnY3f7mpq2O4PC5zlDxYRTCI4eNltSfRGUSUtK54A1CnGGa1VYX0qyAI_drnBN5GP6M6psoSp3Yar-jN6tOMn7g424vqLSrtxrhb8_z=5Vjd1ER-ow6sCTmguD4nGNMXrjUQG=Vjwu2ZjpoXrK5-zqP0xkIQFkjrUNISMJHqGes=YephlO-eU2bj2ooh4TRe2ISLnm-dZcHkrXslYeGbOk6220Z4-bRX4fchIgA1hfenSHuQjVJ1-iDgn6GZsP-8u-ZLPVbiRKO_72rfMiTbzXs2M=b5f=uOY5x=8WeElSlGwDXBJUjNHJrP=vTVlAqcON7Ii5yJBGKZ7KjB1ADD1=sze_GApfKhEAveUjxFWZdahh1c8wRwASQF8Is-YRrE1pzVespRhRqkiOHAU0f=HSI5mgG8=6-uLYh1eVC2I73e=drG1damuKxYnzC4y43TR3N-s5ZO=o6rpiBw2g-xa0eayDSlXg5ryCM1zcYjxFmoJUT-3I3i=BGn3=sSrqe1HqxjkgOMSPDBuFBPd7=zcs1zkMrzEJSUS_IYJe_VBeHIM2XdqmUVI6jE3ArPeZFF0EA=ec_amHNJ4M1pUo22xDLDP=lGhHU23lILZvOTNoAMl8cIJUJOFzapH1HHSGTYlKsM5iZfv3YChnffouMUVsn526QlEdpI2ICl6Er--fufSn7Jr3R7pTw7D=Yj0j0Gqh10izUWjnS73IDCI6h3qU1J1eHUJWDA1OVg5C_vkMnhvI-2_1PR6-jqgFrxnlqWm3Ic1sCbhHjlX56yNUj0eyK-btqntdqwUfdLnh2WLO8fW=F1sPqKFpxmG0nZJUj=NN1BFp8k48bpAgwiryDTMxwil_jUCcqaMATq2r6=o=B_rAWPuNI02rKTJaNF5Q-MIPa_DmjosDuwjzKbjgFGh5_toBa4I1pw4eFmwl0abVJVlX6KgfzNm0K7DiEbHJ0dlCcCLXnGrV=VM5VVg1SLu5KrYR_tTVIIhgEmSUsq=EbX5qavdidIiMSFh0us7xwgfLOcRkNuyt70nanzslL3Q6sDbKC-0PjnQNKum8bugLdASMk1BgkGfud5YuBYl-alLLKa1BFZTS4Vf-Z8bI4QEr3Yjh=Njc=nA7lYU4W13W-DRcLlxmV58FbVR1JCCbNTHj2qPtP6mHpjXqZq6IvU37kC56yMVKLJWGyrlleMy3_PzUjYq1rkLF=FxpMauMB8OaxzNW02qqoVpwBpgclKlw=BHPze8I8IDoiKHZ5T4PMJfWa6O54Yfr7GCWB3sGDRdIuW3EcAe408_EAtgGgUatMz_-0r=L0jDgLuD6SLvL0qdbrgDaSfqVzCrEJePZflJVDtmdQka_asCvZiC-Mon8ndGlDFko',
    'yyvzcfzh4c-b': 't36pt2',
    'yyvzcfzh4c-c': 'AODgUgZ7AQAAp771yttJ4OS5eY-379_gKKi8lNbzWkDDukGNm7i_hs87uM_9',
    'yyvzcfzh4c-d': 'ABYQoAuAAKgAhgCAAICQwAKIAIEwBLi_hs87uM_9AAAAADI2Up8AKWBoPxIlKCPqRbb6sWoXRA',
    'yyvzcfzh4c-e': 'b;Wqs3zz-J-F2yAk-3eSGYGL8X-h1d-tr1X5G8AT1CcpD6T-RzpT9X54un7rP2zdK8LCBdgwpp5O9-x_TzWe-b_gFr27mVg82zPVJSGa09y8ESk2JArn8W1xXMTY0VdEMLDnduIPoUvwexsZ_pa837oiMj3vgeq6CxyP9z7RyyZCpJSEtzAy_JtP3cLLFSNlUBx-7uH8YmMSruggxY00NxS62gbfppYdXNEuyu_jZqM0mlxtOzrnpdA_VtlT3Rh_fRFnD5xlT4uszomUHSnl9HL9Hc-GQuVi4i05y9i_HRx5ntfWUuqKLzR8rXaFLvR65owg6-o5PKd6w-h1U3lkJ0HkudIdVAoFIqk8_6PyUU6xtAtfATYRL3BYk0v0zg4vdMNNa2XdqIHXhr9AR3YrdCfjMVSnWEeWv3uA1aa8y4ajGZyYz8AlLD1EnAmg71J5pQ__2IS2Dj8KT8Vv-JeWw6G-3fI54vqgq2EYH-ra2_pQIK-4MKMVQEX1zbpC1MMebCukZ7zbKKcWuy6LtIex3dXO0bQSlNfcg_MMvklx2hF4BVPbNrnQ2FM7HffmDO7PyP7NIznjp7PUPrqDwEGNoK7hlHx30OFUuiQpoSTBgAlM7ye5bSJVfIWyKzMuX-u3eTTTFetx_hGPpBVFaQ0xegEgA_A7Zzd-GETJ3Y9KtX1vblclPkJLHODJn2AGwh6xAKF9U-j5OHouOXozby3SgIDYHnBZYq_j7jvyDh5XrCZN069H-zUxUB4vbBmELbeu9DvEoEwCgnI8q3QUoB7p7QTIZj3eUJLOb5XsZuYocjxxgJ_JLJ179nCiaKQ4U1m46YVo_CFw2_07u8Sz2jK61oDrYu3q4jWWANHBz05jFklguJLb8lgcYeUvqSl_I5o2HjRWVA-W0iysIq9L6-LCIJwTwkC09pk1WKNwoSf1URgIfJI6wqLH4SUNeiPCInJbFGzqI=;pbwg_k7RF2XqUqeoekjBzGKW1cbja80DDMCnFjDImFw=',
    'yyvzcfzh4c-f':'A-gsUwZ7AQAAlUQbiEKuMekvk8tL_9ZVXAxbbj4zgCfyyPOj6eWarNaqKNu3AVprVnpx9oukAAAO8YLqosIO8Q==',
},
{
    'yyvzcfzh4c-a': 'u8J3xPGg5M_0s1RXM-x2NO6IzfPxobCT6xEgH_vgnavxRWjItIi1QGLv72o36gVxfXYbIEttxj=lEvrvi0-UJCq6Bqb3zjepVgxavsUZrua-LesC5zF3cdKE-uyyjCQkl0d3xhQDR8mXGHR02Crn_8jbvy8id3ITUa6JSss0OWio=eYGU==-QYfbNq1F5ADyE8KdHj3SSrmt3FSZF1=g6dzUeqyxrSNH2kp6-uQnXcHKtK=8VdE_h5Cigad8QqtMy6L225Llr-cYzw=1k171e3-oEnY3f7mpq2O4PC5zlDxYRTCI4eNltSfRGUSUtK54A1CnGGa1VYX0qyAI_drnBN5GP6M6psoSp3Yar-jN6tOMn7g424vqLSrtxrhb8_z=5Vjd1ER-ow6sCTmguD4nGNMXrjUQG=Vjwu2ZjpoXrK5-zqP0xkIQFkjrUNISMJHqGes=YephlO-eU2bj2ooh4TRe2ISLnm-dZcHkrXslYeGbOk6220Z4-bRX4fchIgA1hfenSHuQjVJ1-iDgn6GZsP-8u-ZLPVbiRKO_72rfMiTbzXs2M=b5f=uOY5x=8WeElSlGwDXBJUjNHJrP=vTVlAqcON7Ii5yJBGKZ7KjB1ADD1=sze_GApfKhEAveUjxFWZdahh1c8wRwASQF8Is-YRrE1pzVespRhRqkiOHAU0f=HSI5mgG8=6-uLYh1eVC2I73e=drG1damuKxYnzC4y43TR3N-s5ZO=o6rpiBw2g-xa0eayDSlXg5ryCM1zcYjxFmoJUT-3I3i=BGn3=sSrqe1HqxjkgOMSPDBuFBPd7=zcs1zkMrzEJSUS_IYJe_VBeHIM2XdqmUVI6jE3ArPeZFF0EA=ec_amHNJ4M1pUo22xDLDP=lGhHU23lILZvOTNoAMl8cIJUJOFzapH1HHSGTYlKsM5iZfv3YChnffouMUVsn526QlEdpI2ICl6Er--fufSn7Jr3R7pTw7D=Yj0j0Gqh10izUWjnS73IDCI6h3qU1J1eHUJWDA1OVg5C_vkMnhvI-2_1PR6-jqgFrxnlqWm3Ic1sCbhHjlX56yNUj0eyK-btqntdqwUfdLnh2WLO8fW=F1sPqKFpxmG0nZJUj=NN1BFp8k48bpAgwiryDTMxwil_jUCcqaMATq2r6=o=B_rAWPuNI02rKTJaNF5Q-MIPa_DmjosDuwjzKbjgFGh5_toBa4I1pw4eFmwl0abVJVlX6KgfzNm0K7DiEbHJ0dlCcCLXnGrV=VM5VVg1SLu5KrYR_tTVIIhgEmSUsq=EbX5qavdidIiMSFh0us7xwgfLOcRkNuyt70nanzslL3Q6sDbKC-0PjnQNKum8bugLdASMk1BgkGfud5YuBYl-alLLKa1BFZTS4Vf-Z8bI4QEr3Yjh=Njc=nA7lYU4W13W-DRcLlxmV58FbVR1JCCbNTHj2qPtP6mHpjXqZq6IvU37kC56yMVKLJWGyrlleMy3_PzUjYq1rkLF=FxpMauMB8OaxzNW02qqoVpwBpgclKlw=BHPze8I8IDoiKHZ5T4PMJfWa6O54Yfr7GCWB3sGDRdIuW3EcAe408_EAtgGgUatMz_-0r=L0jDgLuD6SLvL0qdbrgDaSfqVzCrEJePZflJVDtmdQka_asCvZiC-Mon8ndGlDFko',
    'yyvzcfzh4c-b': 't36pt2',
    'yyvzcfzh4c-c': 'AODgUgZ7AQAAp771yttJ4OS5eY-379_gKKi8lNbzWkDDukGNm7i_hs87uM_9',
    'yyvzcfzh4c-d': 'ABYQoAuAAKgAhgCAAICQwAKIAIEwBLi_hs87uM_9AAAAADI2Up8AKWBoPxIlKCPqRbb6sWoXRA',
    'yyvzcfzh4c-e': 'b;zoOzJmPiEE7Sh5S1HMg-c6_lthwAMlnusvUDbLWbdw5tWEuOF_ImSReBXI_O9Z6OkdH7lvqyvrby3ZHN53--DhJitMm1K9t0jTbYNHqDOK3OA2v47bSveOs-9LtJDZMmzNv0KzKGe6vnXpESP2tnXNOE7zVVU4exL-vqZa_U4Bnmv8Krc-jykQR3gHJph0zxraEQdMVYFYKS5g9TM0MZgzBLaN7AiwANWA5sdUGmbOllb8ptKMiqgUICkztoI6YuIb2BaYlAOvxAxzPx-3h9lE7lY6X0_XXIOR3TI80AdEAyl4lTkmgFMoZNWhICN4E5OAy1M6rkmwSS_lhtTDYI5eZlPRUlQ7TqfnMfR8jg8D9FmAgpIQ8MRwJFQY7fsRRIIpGS5eHYtTkCEzs423vOiNBKAyyYimbM-PCFGK05CHt6liMb9ZtAhGrtAHAlfYTB1267WoZZAaUffX9G2Eixvl9yXHBxqWQgJhaLFbeH5rn0VxJ0pbegAB-Ez6wY44dMkR8qx1ASUFC4VoeyVLIWvT9LAkDSraPjfLjQHc998_8L_17DEVPvAjxlDBEZjFSgjJsX7JpDJFp9nwtNKLUbfh4D-Eo-JV9jSfvyjiLLh1P-mcvYHeVNDiYnZ_VWkEJNWx86cJhK5UOqyzN0SN4MOWSHn029ZIbVaCqNsecTTYmNcVYweUGxvJe7aHR-z3Hra9WX3UyPO4Y4tULNbPRZH9E_aPJ7ZsAonYtkKnTXqKFQWiNRZN1E-mmw59HZX716yLc4NTgv4noC8FySbcpnx5R40XOmHf9Eeet83xqwo2sikyV8PyIq0unJER1EQjz4ftBkOmFHKbgjt9lto6SJqL0ctJPPbp8NAJlzAD1agrN9m1ZfuiJJyrzbw18FWzsNw0Tkm-bTy48SA4hDKa_tVtLUbmF-5WbUcfmbIkSHWJp-aTdAGFydBQ6rql9kMHUnzw==;OQ4z18eccSx5SiYHIJAXpBmPZWVMpkHVr66J2CpJ4mw=',
    'yyvzcfzh4c-f':'A-gsUwZ7AQAAlUQbiEKuMekvk8tL_9ZVXAxbbj4zgCfyyPOj6eWarNaqKNu3AVprVnpx9oukAAAO8YLqosIO8Q==',
},
{
    'yyvzcfzh4c-a': 'u8J3xPGg5M_0s1RXM-x2NO6IzfPxobCT6xEgH_vgnavxRWjItIi1QGLv72o36gVxfXYbIEttxj=lEvrvi0-UJCq6Bqb3zjepVgxavsUZrua-LesC5zF3cdKE-uyyjCQkl0d3xhQDR8mXGHR02Crn_8jbvy8id3ITUa6JSss0OWio=eYGU==-QYfbNq1F5ADyE8KdHj3SSrmt3FSZF1=g6dzUeqyxrSNH2kp6-uQnXcHKtK=8VdE_h5Cigad8QqtMy6L225Llr-cYzw=1k171e3-oEnY3f7mpq2O4PC5zlDxYRTCI4eNltSfRGUSUtK54A1CnGGa1VYX0qyAI_drnBN5GP6M6psoSp3Yar-jN6tOMn7g424vqLSrtxrhb8_z=5Vjd1ER-ow6sCTmguD4nGNMXrjUQG=Vjwu2ZjpoXrK5-zqP0xkIQFkjrUNISMJHqGes=YephlO-eU2bj2ooh4TRe2ISLnm-dZcHkrXslYeGbOk6220Z4-bRX4fchIgA1hfenSHuQjVJ1-iDgn6GZsP-8u-ZLPVbiRKO_72rfMiTbzXs2M=b5f=uOY5x=8WeElSlGwDXBJUjNHJrP=vTVlAqcON7Ii5yJBGKZ7KjB1ADD1=sze_GApfKhEAveUjxFWZdahh1c8wRwASQF8Is-YRrE1pzVespRhRqkiOHAU0f=HSI5mgG8=6-uLYh1eVC2I73e=drG1damuKxYnzC4y43TR3N-s5ZO=o6rpiBw2g-xa0eayDSlXg5ryCM1zcYjxFmoJUT-3I3i=BGn3=sSrqe1HqxjkgOMSPDBuFBPd7=zcs1zkMrzEJSUS_IYJe_VBeHIM2XdqmUVI6jE3ArPeZFF0EA=ec_amHNJ4M1pUo22xDLDP=lGhHU23lILZvOTNoAMl8cIJUJOFzapH1HHSGTYlKsM5iZfv3YChnffouMUVsn526QlEdpI2ICl6Er--fufSn7Jr3R7pTw7D=Yj0j0Gqh10izUWjnS73IDCI6h3qU1J1eHUJWDA1OVg5C_vkMnhvI-2_1PR6-jqgFrxnlqWm3Ic1sCbhHjlX56yNUj0eyK-btqntdqwUfdLnh2WLO8fW=F1sPqKFpxmG0nZJUj=NN1BFp8k48bpAgwiryDTMxwil_jUCcqaMATq2r6=o=B_rAWPuNI02rKTJaNF5Q-MIPa_DmjosDuwjzKbjgFGh5_toBa4I1pw4eFmwl0abVJVlX6KgfzNm0K7DiEbHJ0dlCcCLXnGrV=VM5VVg1SLu5KrYR_tTVIIhgEmSUsq=EbX5qavdidIiMSFh0us7xwgfLOcRkNuyt70nanzslL3Q6sDbKC-0PjnQNKum8bugLdASMk1BgkGfud5YuBYl-alLLKa1BFZTS4Vf-Z8bI4QEr3Yjh=Njc=nA7lYU4W13W-DRcLlxmV58FbVR1JCCbNTHj2qPtP6mHpjXqZq6IvU37kC56yMVKLJWGyrlleMy3_PzUjYq1rkLF=FxpMauMB8OaxzNW02qqoVpwBpgclKlw=BHPze8I8IDoiKHZ5T4PMJfWa6O54Yfr7GCWB3sGDRdIuW3EcAe408_EAtgGgUatMz_-0r=L0jDgLuD6SLvL0qdbrgDaSfqVzCrEJePZflJVDtmdQka_asCvZiC-Mon8ndGlDFko',
    'yyvzcfzh4c-b': 't36pt2',
    'yyvzcfzh4c-c': 'AODgUgZ7AQAAp771yttJ4OS5eY-379_gKKi8lNbzWkDDukGNm7i_hs87uM_9',
    'yyvzcfzh4c-d': 'ABYQoAuAAKgAhgCAAICQwAKIAIEwBLi_hs87uM_9AAAAADI2Up8AKWBoPxIlKCPqRbb6sWoXRA',
    'yyvzcfzh4c-e': 'b;zoOzJmPiEE7Sh5S1HMg-c6_lthwAMlnusvUDbLWbdw5tWEuOF_ImSReBXI_O9Z6OkdH7lvqyvrby3ZHN53--DhJitMm1K9t0jTbYNHqDOK3OA2v47bSveOs-9LtJDZMmzNv0KzKGe6vnXpESP2tnXNOE7zVVU4exL-vqZa_U4Bnmv8Krc-jykQR3gHJph0zxraEQdMVYFYKS5g9TM0MZgzBLaN7AiwANWA5sdUGmbOllb8ptKMiqgUICkztoI6YuIb2BaYlAOvxAxzPx-3h9lE7lY6X0_XXIOR3TI80AdEAyl4lTkmgFMoZNWhICN4E5OAy1M6rkmwSS_lhtTDYI5eZlPRUlQ7TqfnMfR8jg8D9FmAgpIQ8MRwJFQY7fsRRIIpGS5eHYtTkCEzs423vOiNBKAyyYimbM-PCFGK05CHt6liMb9ZtAhGrtAHAlfYTB1267WoZZAaUffX9G2Eixvl9yXHBxqWQgJhaLFbeH5rn0VxJ0pbegAB-Ez6wY44dMkR8qx1ASUFC4VoeyVLIWvT9LAkDSraPjfLjQHc998_8L_17DEVPvAjxlDBEZjFSgjJsX7JpDJFp9nwtNKLUbfh4D-Eo-JV9jSfvyjiLLh1P-mcvYHeVNDiYnZ_VWkEJNWx86cJhK5UOqyzN0SN4MOWSHn029ZIbVaCqNsecTTYmNcVYweUGxvJe7aHR-z3Hra9WX3UyPO4Y4tULNbPRZH9E_aPJ7ZsAonYtkKnTXqKFQWiNRZN1E-mmw59HZX716yLc4NTgv4noC8FySbcpnx5R40XOmHf9Eeet83xqwo2sikyV8PyIq0unJER1EQjz4ftBkOmFHKbgjt9lto6SJqL0ctJPPbp8NAJlzAD1agrN9m1ZfuiJJyrzbw18FWzsNw0Tkm-bTy48SA4hDKa_tVtLUbmF-5WbUcfmbIkSHWJp-aTdAGFydBQ6rql9kMHUnzw==;OQ4z18eccSx5SiYHIJAXpBmPZWVMpkHVr66J2CpJ4mw=',
    'yyvzcfzh4c-f':'A-gsUwZ7AQAAlUQbiEKuMekvk8tL_9ZVXAxbbj4zgCfyyPOj6eWarNaqKNu3AVprVnpx9oukAAAO8YLqosIO8Q==',
},



]

const createAccount = async (proxy,email,headerTab) => {
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
                'yyvzcfzh4c-a': headerTab['yyvzcfzh4c-a'],
                'yyvzcfzh4c-b':  headerTab['yyvzcfzh4c-b'],
                'accept-language': 'fr-fr',
                'yyvzcfzh4c-c':  headerTab['yyvzcfzh4c-c'],
                'yyvzcfzh4c-z': 'q',
                'accept-encoding': 'gzip, deflate, br', 
                'yyvzcfzh4c-d': headerTab['yyvzcfzh4c-d'],
                'user-agent': 'END/871 CFNetwork/1206 Darwin/20.1.0',
                'yyvzcfzh4c-e':  headerTab['yyvzcfzh4c-e'],
                'yyvzcfzh4c-f': headerTab['yyvzcfzh4c-f'],
              
                               
            },
            method: 'POST',
            timeout: 10000,
            url: 'https://api2.endclothing.com/en-fr/rest/V1/customers',
            data: {
                "customer": {
                    "email": email,
                    "lastname": "Mofuss",
                    "custom_attributes": [{
                        "value": "3",
                        "attribute_code": "account_origin"
                    }, {
                        "value": "0",
                        "attribute_code": "marketing_opt_in"
                    }],
                    "firstname": "Mifckey"
                },
                "password": "yodlo!Jfh"
            },
            proxy: proxyConfig
        })


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
                console.log(err.response.data)
                console.log('retry')
            
                return -2
            }
            if (err.response.status == '400') {
                console.log('already exist')
                return -1
            }
        } catch (e) { }
    console.log(err)
    }

}

function sleep(ms) {
    return new Promise(
      resolve => setTimeout(resolve, ms)
    );
  }

async function main() {

    proxyList = await csvproxyreader()
    // console.log(proxyList)
    list = 0
    emailList = [
        'kinzysammartin7442@outlook.com',
        'pierre-josephknepper1728@outlook.com',
        'rewanmalpezzi6705@outlook.com',
        'savannaplaterrier9157@outlook.com'
    ]
    headerNum = 0
    
    for (i in emailList) {
        console.log(emailList[i])
        error = await createAccount(proxyList[list], emailList[i],headerTab[headerNum])
        while (error == -2) {
            list++
            headerNum++
            error = await createAccount(proxyList[list], emailList[i],headerTab[headerNum])
        }
        console.log('Created account ' + emailList[i])
        
      
    }
}

main()

