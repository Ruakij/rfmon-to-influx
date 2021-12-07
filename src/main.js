"use strict";
const logFactory = require("./helper/logger.js");
const logger = logFactory("main");

const { requireEnvVars } = require("./helper/env.js");
const { exit } = require("process");
const { exec } = require("./helper/exec.js");
const Os = require("os");

const { InfluxDB } = require("@influxdata/influxdb-client");
const InfluxChecks = require("./helper/influx-checks.js");

const { RegexBlockStream } = require("./streamHandler/RegexBlockStream.js");
const { PacketStreamFactory } = require("./streamHandler/PacketStreamFactory.js");
const { PacketInfluxPointFactory } = require("./streamHandler/PacketInfluxPointFactory.js");
const { InfluxPointWriter } = require("./streamHandler/InfluxPointWriter.js");

const userHelper = require("./helper/userHelper.js");


/// Setup ENVs
const env = process.env;
// Defaults
{
    env.LOGLEVEL            ??= "INFO";
    env.WIFI_INTERFACE      ??= "wlan0";
    env.HOSTNAME            ??= Os.hostname();
}
// Required vars
let errorMsg = requireEnvVars([
    "INFLUX_URL", "INFLUX_TOKEN",
    "INFLUX_ORG", "INFLUX_BUCKET"
]);
if(errorMsg){
    logger.fatal(errorMsg);
    exit(1);
}

(async function() {
    logger.info("Setup Influx..");
    const influxDb = new InfluxDB({url: env.INFLUX_URL, token: env.INFLUX_TOKEN});

    await InfluxChecks.checkHealth(influxDb)
        .then((res) => {return InfluxChecks.checkBucket(influxDb, {
            org: env.INFLUX_ORG,
            name: env.INFLUX_BUCKET
        });})
        .then((res) => {return InfluxChecks.checkWriteApi(influxDb, {
            org: env.INFLUX_ORG,
            bucket: env.INFLUX_BUCKET
        });})
        .catch((err) => {
            if(err) {
                logger.error("Error whilst checking influx:");
                logger.error(err);
            }
            logger.fatal("Setup influx failed!");
            exit(1);
        });

    logger.debug("Get WriteApi & set default-hostname to", `'${env.HOSTNAME}'`);
    const influxWriteApi = influxDb.getWriteApi(env.INFLUX_ORG, env.INFLUX_BUCKET, "us");
    //influxWriteApi.useDefaultTags({"hostname": env.HOSTNAME});
    logger.info("Influx ok");

    logger.info("Starting tcpdump..");
    const TCPDUMP_BASECMD = "tcpdump -vvv -e -n -X -s0 -i";
    let cmd = `${TCPDUMP_BASECMD} ${env.WIFI_INTERFACE}`;

    let proc = exec(cmd);
    logger.debug("Creating & Attaching streams..");
    let regexBlockStream = new RegexBlockStream(/^\d{2}:\d{2}:\d{2}.\d{6}.*(\n( {4,8}|\t\t?).*)+\n/gm);
    let packetStreamFactory = new PacketStreamFactory();
    let packetInfluxPointFactory = new PacketInfluxPointFactory();
    let influxPointWriter = new InfluxPointWriter(influxWriteApi);
    proc.stdout
        .setEncoding("utf8")
        .pipe(regexBlockStream)
        .pipe(packetStreamFactory)
        .pipe(packetInfluxPointFactory)
        .pipe(influxPointWriter);

    logger.debug("Attaching error-logger..");
    const loggerTcpdump = logFactory("tcpdump");
    let linkTypeId;
    proc.stderr.setEncoding("utf8").on("data", (data) => {
        if(data.match(/^(tcpdump: )?listening on /i) || data.match(/^\d+ packets captured/i)) {  // Catch start-error
            loggerTcpdump.debug(data);

            if(!linkTypeId && data.match(/^(tcpdump: )?listening on/i)){   // Grab first data containing listen-info if proper header was found
                const linkType = data.match(/((?<=link-type ))([a-z].*?) \(.*?\)(?=,)/i)[0];
                const linkTypeData = linkType.match(/(\S*) (.*)/i);
                const linkTypeId = linkTypeData[1];
                const linkTypeDetail = linkTypeData[2];
    
                if(linkTypeId !== "IEEE802_11_RADIO"){
                    logger.error(`Interface not in Monitor-mode! (Expected 'IEEE802_11_RADIO', but got '${linkTypeId}')`);
                    shutdown(1, "SIGKILL");
                }
            }
        }
        else loggerTcpdump.error(data);
    });

    // FIXME: This is a hacky workaround to not let errors from subprocess bubble up and terminate our process
    regexBlockStream.on("error", (err) => {});

    proc.on("error", (err) => {
        loggerTcpdump.error(err);
    });

    const loggerPacketStream = logFactory("PacketStreamFactory");
    userHelper.detectStreamData(proc.stdout, 10000)       // Expect tcpdump-logs to have data after max. 10s
        .then(() => {
            loggerTcpdump.debug("Got first data");
            userHelper.detectStreamData(packetStreamFactory, 10000)      // Expect then to have packets after further 10s
                .then(() => {
                    loggerPacketStream.debug("Got first packet");
                })
                .catch((err) => {
                    if(err == "timeout") loggerPacketStream.warn("No packets");
                });
        })
        .catch((err) => {
            if(err == "timeout") loggerTcpdump.warn("No data after 10s! Wrong configuration?");
        });

    logger.debug("Attaching exit-handler..");
    proc.on("exit", (code) => {
        loggerTcpdump.debug(`tcpdump exited code: ${code}`);
        if (code) {
            loggerTcpdump.fatal(`tcpdump exited with non-zero code: ${code}`);
            if(!exitCode) exitCode = 1;     // When exitCode is 0, set to 1
        }
        logger.info("Shutdown");
        exit(exitCode);
    });

    // Handle stop-signals for graceful shutdown
    var exitCode = 0;
    function shutdownReq() {
        logger.info("Shutdown request received..");
        shutdown();
    }
    function shutdown(code, signal = "SIGTERM"){
        if(code) exitCode = code;
        logger.debug("Stopping subprocess tcpdump, then exiting myself..");
        proc.kill(signal);    // Kill process, then upper event-handler will stop self
    }
    process.on("SIGTERM", shutdownReq);
    process.on("SIGINT", shutdownReq);

    logger.info("Startup complete");
})();
