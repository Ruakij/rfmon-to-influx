function requireEnvVars(requiredEnv){
    // Ensure required ENV vars are set
    let unsetEnv = requiredEnv.filter((env) => !(typeof process.env[env] !== 'undefined'));

    if (unsetEnv.length > 0) {
        return "Required ENV variables are not set: [" + unsetEnv.join(', ') + "]";
    }
}

// Specify exports
module.exports = {
    requireEnvVars
};