const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const { BIP32Factory } = require('bip32')
const ecc = require('tiny-secp256k1')
const bip32 = BIP32Factory(ecc)
const fs = require('fs');
var bitcoinMessage = require('bitcoinjs-message')

bitcoin.initEccLib(ecc)

// 幻影钱包白名单地址
const whitelistAddressMnemonic1 = '';    // 白名单钱包助记词
const whitelistAddressNum1 = 20;

// unisat白名单地址
const whitelistAddressMnemonic2 = '';    // 白名单钱包助记词
const whitelistAddressMnemonic3 = '';    // 白名单钱包助记词
const whitelistAddressNum2 = 10;

// 生成rgb地址用来提交
const rgbAddressMnemonic = '';   //RGB钱包 建议使用新的wizz钱包助记词
const rgbAddressNum = 40;
const message = 'jerrysbox'
const network = bitcoin.networks.bitcoin;

let whitelistAddresses = [];
let whitelistPublicKey = [];
let signatures = [];
let rgbAddresses = [];

// 生成native segwit地址 bc1q开头
function generateWhitelistAddressesAndSignMessage_bc1q(whitelistAddressMnemonic, whitelistAddressNum) {
    const seed = bip39.mnemonicToSeedSync(whitelistAddressMnemonic);
    const root = bip32.fromSeed(seed);

    for (let i = 0; i < whitelistAddressNum; i++) {
      const path = `m/84'/0'/0'/0/${i}`;
      const keyPair = root.derivePath(path);
      
      // 消息签名
      const signature = bitcoinMessage.sign(message, keyPair.privateKey, keyPair.compressed)

      const { address } = bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: bitcoin.networks.bitcoin,
      });
      console.log(`地址${i + 1 } native swgwit地址: ${address}, publibkey地址: ${ keyPair.publicKey.toString('hex')}`);
      whitelistAddresses.push(address);
      whitelistPublicKey.push(keyPair.publicKey.toString('hex'));
      signatures.push(signature.toString('base64'));
    }
}

function createKeySpendOutput(publicKey) {
  const myXOnlyPubkey = publicKey.slice(1, 33);
  const commitHash = bitcoin.crypto.taggedHash('TapTweak', myXOnlyPubkey);
  const tweakResult = ecc.xOnlyPointAddTweak(myXOnlyPubkey, commitHash);
  if (tweakResult === null) throw new Error('Invalid Tweak');
  const { xOnlyPubkey: tweaked } = tweakResult;
  return Buffer.concat([
      Buffer.from([0x51, 0x20]),
      tweaked,
  ]);
}

// 生成taproot地址 bc1p开头
function generateWhitelistAddressesAndSignMessage_bc1p(whitelistAddressMnemonic, whitelistAddressNum) {
  const seed = bip39.mnemonicToSeedSync(whitelistAddressMnemonic);
  const root = bip32.fromSeed(seed);
  
  for (let i = 0; i < whitelistAddressNum; i++) {
    const path = `m/86'/0'/0'/0/${i}`;
    const keyPair = root.derivePath(path);

    // 消息签名
    const signature = bitcoinMessage.sign(message, keyPair.privateKey, keyPair.compressed)

    const output = createKeySpendOutput(keyPair.publicKey);
    const address = bitcoin.address.fromOutputScript(output, network);

    console.log(`地址${i + 1 } taproot地址: ${address}, publibkey地址: ${ keyPair.publicKey.toString('hex')}`);
    whitelistAddresses.push(address);
    whitelistPublicKey.push(keyPair.publicKey.toString('hex'));
    signatures.push(signature.toString('base64'));
  }
}

function generateRGBAddresses(rgbAddressNum) {
  const seed = bip39.mnemonicToSeedSync(rgbAddressMnemonic);
  const root = bip32.fromSeed(seed);
  for (let i = 100; i < rgbAddressNum + 100; i++) {
      const path = `m/84'/0'/0'/9/${i}`;
      const keyPair = root.derivePath(path);
      const { address } = bitcoin.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network: bitcoin.networks.bitcoin,
      });
      rgbAddresses.push(address);
      console.log(`地址${i + 1}: ${address}`)
  }
}

generateWhitelistAddressesAndSignMessage_bc1q(whitelistAddressMnemonic1, whitelistAddressNum1);
generateWhitelistAddressesAndSignMessage_bc1p(whitelistAddressMnemonic2, whitelistAddressNum2);
generateWhitelistAddressesAndSignMessage_bc1p(whitelistAddressMnemonic3, whitelistAddressNum2);
generateRGBAddresses(rgbAddressNum);

const addressData = {
    "rgbAddress": rgbAddresses,
    "publickey": whitelistPublicKey,
    "whitelistAddress": whitelistAddresses,
    "signature": signatures
};

fs.writeFileSync('./config/allParams.json', JSON.stringify(addressData, null, 4));