const axios = require('axios');
const fs = require('fs');


async function submit(rgb_address, whitelist_address, sign_value, pubkey) {
    try {
        let data = JSON.stringify({
            "rgb": rgb_address,
            "wallet": whitelist_address,
            "sign": sign_value,
            "pubkey": pubkey
        });

        let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://jerrysbox.xyz/api/register',
        headers: { 
            'accept': '*/*', 
            'accept-language': 'zh-CN,zh;q=0.9', 
            'cache-control': 'no-cache', 
            'content-type': 'application/json', 
            'origin': 'https://jerrysbox.xyz', 
            'pragma': 'no-cache', 
            'priority': 'u=1, i', 
            'referer': 'https://jerrysbox.xyz/', 
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36', 
        },
            data : data
        };

        const submit_response = await axios.request(config);
        console.log(submit_response.data);
    } catch (error) {
        if (error.response) {
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

(async () => {
    const allParams = fs.readFileSync('./config/allParams.json', 'utf-8');
    const allParamsJSON = JSON.parse(allParams);
    const length = allParamsJSON.rgbAddress.length;
    console.log(length)
    for (let i = 0; i < length; i++) {
        const rgbAddress = allParamsJSON.rgbAddress[i];
        const publicKey = allParamsJSON.publickey[i];
        const taproot = allParamsJSON.whitelistAddress[i];
        const signature = allParamsJSON.signature[i];

        await submit(rgbAddress, taproot, signature, publicKey);
    }
})();