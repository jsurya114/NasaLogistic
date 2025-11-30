import { createClient } from 'redis';
import dotenv from 'dotenv'
dotenv.config();

const RedisClient = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

RedisClient.on('error', err => console.log('Redis Client Error', err));

await RedisClient.connect();
 export default RedisClient

