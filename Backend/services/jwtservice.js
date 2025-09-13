import jwt from "jsonwebtoken";

// Function to generate a token
export const generateToken = (payload, expiresIn = "1h") => {
  const secret = process.env.JWT_EXPIRES_IN;
  return jwt.sign(payload, secret, { expiresIn });
};
