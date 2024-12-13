const { MongoClient, ObjectId } = require('mongodb');

const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);

async function connectToDb() {
    await client.connect();
    const database = client.db('Films');
    return { client, database };
}

module.exports = {
    connectToDb,
    ObjectId,
};
