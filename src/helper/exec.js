const logger = require("./logger.js")("exec");

const { spawn } = require("child_process");


function exec(cmd, options){

    logger.addContext("binary", "bin");
    logger.debug(`Spawn process '${cmd}'`);
    return spawn(bin, args, options);
}

// Specify exports
module.exports = {
    exec
};