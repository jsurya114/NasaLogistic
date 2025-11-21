import HttpStatus from '../utils/statusCodes.js';
import { verifyToken } from '../services/jwtservice.js';
import { isTokenRevoked } from '../services/redis-jwt-service.js';

export default async function driverAuth(req, res, next) {
  try {
    const token = req.cookies?.driverToken;
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'UNAUTHORIZED' });
    }
    const isRevoked = await isTokenRevoked(token);
    if(isRevoked){
      console.log('driver token is revoked')
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'UNAUTHORIZED' });
    }
    const decoded = verifyToken(token);
    req.driver = decoded;
    next();
  } catch (err) {
    console.log('driver auth middleware error',err.message)
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'UNAUTHORIZED' });
  }
}
