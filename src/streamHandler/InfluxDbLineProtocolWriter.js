const logger = require.main.require("./helper/logger.js")("InfluxDbLineProtocolWriter");
const net = require("net");

/**
 * Get points and write them into influx
 */
class InfluxDbLineProtocolWriter extends net.Socket{
    /**
     * 
     * @param {string} host Host of line-server
     * @param {string} port Port of line-server
     * @param {object} options Options for further configuration
     */
    constructor(host, port, options = {}) {
        super();

        this._host = host;
        this._port = port;

        // options defaults
        options.autoConnect     ??= true;
        options.timeout         ??= 5000;
        options.autoReconnect   ??= true;
        this._options = options;

        super.setKeepalive(true, 5000);

        // Register auto-Reconnect if enabled
        if(this._options.autoReconnect){
            this.on("connect", () => {
                logger.debug("Connection established!");

                if(this._autoReconnectTimeout)
                    clearInterval(this._autoReconnectTimeout);
                this._autoReconnectTimeout = 0;
            });

            this.on("error", (err) => {
                logger.error(err.code, "TCP ERROR");
                if(!this._autoReconnectTimeout)
                    this._autoReconnectTimeout = setInterval(() => {
                        this.connect();
                    });
            });
        }

        // Autoconnect if requested
        if(this._options.autoConnect) this.connect();
    }

    get host(){ return this._host; }
    get port(){ return this._port; }

    connect(){
        logger.debug("Connecting..");
        super.connect(this._host, this._port);
    }

    write(buffer, errorCb){
        return super.write(buffer, errorCb);
    }
}

// Specify exports
module.exports = {
    InfluxDbLineProtocolWriter
};