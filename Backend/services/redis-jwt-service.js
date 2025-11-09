import client from '../config/redis.js'

export  function blackListToken(jti){
    console.log(jti,'-> added to blacklist')
    client.set(jti,'revoked')
    client.expire(jti,3600)
    client.ttl(jti)


    
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