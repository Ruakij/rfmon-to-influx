const logger = require("./logger.js")("exec");

const { spawn } = require("child_process");


function exec(cmd, stdout_handler, stderr_handler, exit_handler){
    const [bin, ...args] = cmd.split(' ')

    logger.addContext("binary", "bin");
    logger.debug(`Spawn process '${cmd}'`);
    let proc = spawn(bin, args);

    logger.debug(`Attach stdout, stderr and exit-handler if set`);
    stdout_handler && proc.stdout.on('data', stdout_handler);
    stderr_handler && proc.stderr.on('data', stderr_handler);
    exit_handler   && proc.on('exit', exit_handler);
}

// Specify exports
module.exports = {
    exec
};