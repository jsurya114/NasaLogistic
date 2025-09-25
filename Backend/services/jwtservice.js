import jwt from "jsonwebtoken";

// Function to generate a token
export const generateToken = (payload, expiresIn = "1h") => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken= (token)=>{
    const secret = process.env.JWT_SECRET;
    const decoded =jwt.verify(token, secret);
    // console.log("Decoded ",decoded);
    return decoded;
}

