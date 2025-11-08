import client from '../config/redis.js'

export  function blackListToken(jti){
    console.log(jti,'-> added to blacklist')
    client.set(jti,'revoked','EX',3600)
}

export  async function isTokenRevoked(jti){
    try {
        const reply = await client.get(jti)
        return reply === 'revoked'
    } catch (error) {
        console.log("redis Error: ",error)
        return false
    }
}