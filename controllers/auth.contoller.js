import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import AuditLog from "../models/AuditLog.model.js";

/* REGISTER */
export const register = async (req,res)=>{
  try{
    const {email,password,role} = req.body;
    if(!email || !password || !role)
      return res.status(400).json({ message:"All fields are required" });

    const existUser = await User.findOne({email});
    if(existUser) return res.status(400).json({ message:"User already exists" });


    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt)

    const newUser = await User.create({ email, password: hashpassword, role });

    await AuditLog.create({
      action:"REGISTER",
      entity:"User",
      entityId:newUser._id
    });

    return res.status(201).json({ message:"User registered"});
  }catch(err){
    return res.status(500).json({ message:err.message });
  }
};

/* LOGIN */
export const login = async (req,res)=>{
  try{
    const { email,password } = req.body;
    if(!email || !password){
      return res.status(400).json({
        message:"All fields are required"
      })
    }
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({ message:"User not found" });

    const match = await bcrypt.compare(password,user.password);
    if(!match) return res.status(401).json({ message:"Invalid credentials" });

    const token = jwt.sign({ id:user._id, role:user.role }, JWT_SECRET, { expiresIn:JWT_EXPIRES_IN });

    await AuditLog.create({
      action:"LOGIN",
      entity:"User",
      entityId:user._id
    });

    return res.status(200).json({ message:"Login successful",token });
  }catch(err){
    return res.status(500).json({ message:err.message });
  }
};
