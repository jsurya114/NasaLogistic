import HttpStatus from '../utils/statusCodes.js';
import { verifyToken } from '../services/jwtservice.js';
import { isTokenRevoked } from '../services/redis-jwt-service.js';

export default async function adminAuth(req, res, next) {
    const token = req.cookies?.adminToken;
  try {
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'UNAUTHORIZED' });
    }
    const revoked = await isTokenRevoked(token);
    if(revoked){
      console.log('token is revoked')
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'UNAUTHORIZED' });
    }
    const decoded = verifyToken(token);
    req.admin = decoded;
    next();
  } catch (err) {
    console.log(err.message,token,'err in admin middleware')
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'UNAUTHORIZED' })
  }
}
