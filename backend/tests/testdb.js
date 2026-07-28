import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function testConnection() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Successfully connected to MongoDB!");
    } catch (error) {
        console.error("Connection failed:", error.message);
    } finally {
        await client.close();
    }
}

testConnection();