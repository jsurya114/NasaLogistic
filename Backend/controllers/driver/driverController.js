import HttpStatus from '../../utils/statusCodes.js';
import { loginService } from "../../services/driver/loginQueries.js";
import { generateToken, verifyToken } from '../../services/jwtservice.js';
import {blackListToken} from '../../services/redis-jwt-service.js'

const driverController = {
  Login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const errors={}
       if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (Object.keys(errors).length > 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({ errors });
    }

      const driver = await loginService.getDriverByEmail(email);
       if (!driver) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ errors: { email: "Invalid email" } });
    }

      // Check if driver is disabled/blocked
      if (!driver.enabled) {
        return res.status(HttpStatus.FORBIDDEN).json({ 
          errors: { account: "Your account has been blocked. Please contact support." } 
        });
      }

      const validPassword = await loginService.checkPassword(password, driver.password);
   if (!validPassword) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ errors: { password: "Invalid password" } });
    }

      let token = generateToken({ id: driver.id, email: driver.email, name: driver.name });
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: "UNAUTHORIZED" });
        }

      const isProd = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 60 * 60 * 1000
      };
      // Clear any existing cookie to rotate token
      res.clearCookie("driverToken", { httpOnly: true, secure: cookieOptions.secure, sameSite: cookieOptions.sameSite });
      res.clearCookie("adminToken", { httpOnly: true, secure: cookieOptions.secure, sameSite: cookieOptions.sameSite });

      res.cookie("driverToken", token, cookieOptions);

      res.status(HttpStatus.OK).json({
        message: "Login Successful",
        driver: {
          id: driver.id,
          email: driver.email,
          name: driver.name
        }
      });
    } catch (error) {
      console.error(error.message);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  },

  getDriver: async (req, res) => {
    try {
      const token = req.cookies.driverToken;
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: "UNAUTHORIZED" });
      }

      const decoded = verifyToken(token);
      
      // Fetch driver from database to check current status
      const driver = await loginService.getDriverByEmail(decoded.email);
      
      if (!driver) {
        // Logout if driver not found
        const isProd = process.env.NODE_ENV === 'production';
        const opts = { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' };
        blackListToken(token);
        res.clearCookie("driverToken", opts);
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: "UNAUTHORIZED" });
      }

      // Check if driver is disabled/blocked
      if (!driver.enabled) {
        // Logout immediately
        const isProd = process.env.NODE_ENV === 'production';
        const opts = { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' };
        blackListToken(token);
        res.clearCookie("driverToken", opts);
        return res.status(HttpStatus.UNAUTHORIZED).json({ 
          message: "UNAUTHORIZED",
          reason: "Account has been disabled"
        });
      }

      return res.status(HttpStatus.OK).json({ driver: decoded });
    } catch (error) {
      console.error(error.message);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  },

  Logout:async(req,res)=>{
    const isProd = process.env.NODE_ENV === 'production';
    const opts = { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' };
    const token = req.cookies.driverToken;
    if(token){
      blackListToken(token)
    }
    res.clearCookie("driverToken", opts);
    return res.status(HttpStatus.OK).json({message:"Logged out successfully"})
  }
};

export default driverController;