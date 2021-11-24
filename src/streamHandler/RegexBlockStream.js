const { Transform } = require('stream')

/**
 * Matches whole blocks as regex and passes them on
 */
class RegexBlockStream extends Transform{
    matcher;
    withholdLastBlock;
    matchAllOnFlush;

    /**
     * @param {RegExp} matcher Block-match - WARNING: It should match a clean-block (including e.g. newline)! Otherwise buffer will get dirty and use more and more ressources.
     * @param {boolean} withholdLastBlock When true, the last matches block will not be submitted to prevent submitting incomplete blocks.
     * @param {boolean} matchAllOnFlush (Only in combination with withholdLastBlock) When enabled, the buffer will be matched on last time on _flush (stream deconstruction) and write any, also incomplete, blocks
     */
    constructor(matcher, withholdLastBlock = true, matchAllOnFlush = false){
        super({
            readableObjectMode: true,
            writableObjectMode: true
        });
        
        this.matcher = matcher;
        this.withholdLastBlock = withholdLastBlock;
        this.matchAllOnFlush = matchAllOnFlush;

        this._buffer = "";
    }

    _transform(chunk, encoding, next){
        chunk = this._buffer + chunk;     // Add previous buffer to current chunk

        let matches = chunk.match(this.matcher);    // Match
        if(matches){
            if(this.withholdLastBlock) matches.pop();       // Remove last if we want to withhold it
            chunk = this._writeMatches(matches, chunk);
        }
        
        this._buffer = chunk;   // Store remaining data in buffer
        next();     // Get next chunk
    }

    _writeMatches(matches, chunk = null){
        if(matches){
            matches.forEach((match) => {
                this.push(match);   // Write match to stream
                if(chunk) chunk = chunk.replace(match, '');   // Remove match from chunks
            });
        }
        if(chunk) return chunk;
    }

    _flush(next){
        if(matchAllOnFlush){    // When requested, we'll match one last time over the remaining buffer
            let matches = this._buffer.match(this.matcher);    // Match remaining buffer
            _writeMatches(this._buffer);    // Write matches including last element
        }
        
        next();     // Tell system we are done
    }
}

// Specify exports
module.exports = {
    RegexBlockStream
};