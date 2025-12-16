import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs:15*60*1000, max:10,
  message:{ message:"Too many auth attempts. Try later." }
});

export const geoLimiter = rateLimit({
  windowMs:10*60*1000, max:100,
  message:{ message:"Too many location queries." }
});
