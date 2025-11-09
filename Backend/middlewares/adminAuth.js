import HttpStatus from '../utils/statusCodes.js';
import { verifyToken } from '../services/jwtservice.js';

export default function adminAuth(req, res, next) {
    const token = req.cookies?.adminToken;
  try {
    if (!token) {
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
