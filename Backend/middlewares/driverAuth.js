import HttpStatus from '../utils/statusCodes.js';
import { verifyToken } from '../services/jwtservice.js';

export default function driverAuth(req, res, next) {
  try {
    const token = req.cookies?.driverToken;
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'UNAUTHORIZED' });
    }
    const decoded = verifyToken(token);
    req.driver = decoded;
    next();
  } catch (err) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'UNAUTHORIZED' });
  }
}
