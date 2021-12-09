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
        options.autoReconnectBackoffTime    ??= 3000;
        this._options = options;

        this._isConnected = false;

        super.setKeepAlive(true, 5000);

        // Register auto-Reconnect if enabled
        if(this._options.autoReconnect){
            this.on("connect", () => {
                logger.debug("Connection established!");
                this._isConnected = true;

                if(this._autoReconnectTimeout)
                    clearInterval(this._autoReconnectTimeout);
                this._autoReconnectTimeout = 0;
            });

            this.on("error", (err) => {
                logger.error(err.code, "TCP ERROR");
                this._isConnected = false;
                
                if(!this._autoReconnectTimeout)
                    this._autoReconnectTimeout = setInterval(() => {
                        this.connect();
                    },
                    this._options.autoReconnectBackoffTime);
            });
        }

        // Autoconnect if requested
        if(this._options.autoConnect) this.connect();
    }

    get host(){ return this._host; }
    get port(){ return this._port; }

    get isConnected(){ return this._isConnected; }

    connect(){
        logger.debug("Connecting..");
        super.connect(this._port, this._host);
    }
}

// Specify exports
module.exports = {
    InfluxDbLineProtocolWriter
};