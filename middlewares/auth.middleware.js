import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const requireAuth = (roles = []) => {
  return (req,res,next)=>{
    const header = req.headers.authorization;
    if(!header) return res.status(401).json({ message:"No token provided" });

    const token = header.split(" ")[1];
    try{
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      if(roles.length && !roles.includes(decoded.role)){
        return res.status(403).json({ message:"Access denied" });
      }
      next();
    }catch(err){
      return res.status(401).json({ message:"Invalid token" });
    }
  }
};
