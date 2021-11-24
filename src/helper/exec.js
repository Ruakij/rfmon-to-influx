const logger = require("./logger.js")("exec");

const { spawn } = require("child_process");


function exec(cmd, stdout, stderr, exit_handler){
    const [bin, ...args] = cmd.split(' ')

    logger.addContext("binary", "bin");
    logger.debug(`Spawn process '${cmd}'`);
    let proc = spawn(bin, args);

    return {
        "process": proc,
        "stdout": proc.stdout,
        "stderr": proc.stderr
    }
}

// Specify exports
module.exports = {
    exec
};