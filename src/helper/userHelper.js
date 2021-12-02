// This file specifies functions to help a user with e.g. configuration-errors

function detectStreamData(stream, timeout = 5000){
    return new Promise((resolve, reject) => {
        let timeoutHandler;
        if(timeout){
            timeoutHandler = setTimeout(() => {
                reject("timeout");
                remListeners();
            },
            timeout);
        }

        function remListeners(){ 
            stream.removeListener("error", errorHandler);
            stream.removeListener("data", dataHandler);
            if(timeoutHandler) clearTimeout(timeoutHandler);
        }

        function errorHandler(err) {
            remListeners();
        }
        function dataHandler(data) {
            resolve(data);
            remListeners();
        }

        stream.on("error", errorHandler);
        stream.on("data", dataHandler);
    });    
}

function detectStreamsData(streams, timeout = 5000){
    let promises = [];
    streams.forEach((stream) => {
        promises.push(detectStreamData(stream, timeout));
    });
    return promises;
}


// Specify exports
module.exports = {
    detectStreamData,
    detectStreamsData,
};