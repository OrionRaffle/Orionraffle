
const axios = require('axios-https-proxy-fix');

const signup = async () => {

    proxyconfig = {
      host: '127.0.0.1',
      port: '8888',
    }
  
    try {
      const resp = await axios({
  
    
  
        method: 'POST',
        url: 'https://www.footlocker.fr/apigate/users',
        data: 
        })
      
      console.log(resp)
    } catch (err) {
      console.log(err)
  
    }
  
  }