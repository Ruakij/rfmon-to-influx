
function keyInfoFromRaw(rawKeyInfo) {
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


// Specify exports
module.exports = {
    keyInfoFromRaw,
};