import HttpStatus from '../../utils/statusCodes.js';
import { loginService } from "../../services/driver/loginQueries.js";
import { generateToken, verifyToken } from '../../services/jwtservice.js';

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

      const validPassword = await loginService.checkPassword(password, driver.password);
   if (!validPassword) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ errors: { password: "Invalid password" } });
    }

      let token = generateToken({ id: driver.id, email: driver.email, name: driver.name });
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: "UNAUTHORIZED" });
        }


      res.cookie("driverToken", token, {
        httpOnly: true,
        secure: false, // change to true in production
        sameSite: "strict",
        maxAge: 60 * 60 * 1000 // 1 hour
      });

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
      return res.status(HttpStatus.OK).json({ driver: decoded });
    } catch (error) {
      console.error(error.message);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  },
  Logout:async(req,res)=>{
    res.clearCookie("driverToken")
    res.status(HttpStatus.OK).json({message:"Logged out successfully"})
  }
};

export default driverController;
