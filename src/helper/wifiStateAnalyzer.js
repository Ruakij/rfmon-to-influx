const { HandshakeStage } = require.main.require('./dto/Packet.js');

function keyInfoFromRaw(keyInfoRaw) {
    return {
        "KeyDescriptorVersion": keyInfoRaw>>0 & 0b111,
        "KeyType":              keyInfoRaw>>3 & 0b1,
        "KeyIndex":             keyInfoRaw>>4 & 0b11,
        "Install":              keyInfoRaw>>6 & 0b1,
        "KeyACK":               keyInfoRaw>>7 & 0b1,
        "KeyMIC":               keyInfoRaw>>8 & 0b1,
        "Secure":               keyInfoRaw>>9 & 0b1,
        "Error":                keyInfoRaw>>10 & 0b1,
        "Request":              keyInfoRaw>>11 & 0b1,
        "EncryptedKeyData":     keyInfoRaw>>12 & 0b1,
        "SMKMessage":           keyInfoRaw>>13 & 0b1,
    };
}

const HANDSHAKE_STAGE_KEYINFO = {
    "keys": ["Install", "KeyACK", "KeyMIC", "Secure"],
    "0100": HandshakeStage[1],
    "0010": HandshakeStage[2],
    "1111": HandshakeStage[3],
    "0011": HandshakeStage[4],
};
function handshakeStageFromKeyInfo(keyInfo){

    // Extract compare-keys
    let keyData = "";
    for (const key of HANDSHAKE_STAGE_KEYINFO['keys']) {
        keyData += keyInfo[key].toString();
    }
    
    // Get and return stage
    return  HANDSHAKE_STAGE_KEYINFO[keyData];
}


// Specify exports
module.exports = {
    keyInfoFromRaw,
    handshakeStageFromKeyInfo,
};