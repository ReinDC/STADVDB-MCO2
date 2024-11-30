const connectionPools = require('./conn'); 

const replicateData = (query, callback) => {
    connectionPools.forEach((pool, index) => {
        pool.query(query, (err, results) => {
            if (err) {
                console.error(`Replication failed on Node ${index + 1}:`, err);
            } else {
                console.log(`Data replicated successfully on Node ${index + 1}`);
            }
            if (callback) callback(err, results);
        });
    });
};

module.exports = replicateData;
