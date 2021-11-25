const logger = require("./logger.js")("exec");

const { spawn } = require("child_process");
const { parseArgsStringToArgv } = require('string-argv');


function exec(cmd, options){
    const [bin, ...args] = parseArgsStringToArgv(cmd);

    logger.addContext("binary", "bin");
    logger.debug(`Spawn process '${cmd}'`);
    return spawn(bin, args, options);
}

// Specify exports
module.exports = {
    exec
};