const {JWT_SECRET} = require("./config");
const jwt = require('jsonwebtoken')

const authMiddleware = (req,res,next) =>{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')){
        res.status(403).json({
            msg: "dang it, you aint mine nigga"
        })
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        req.userId = decoded.userId
        next();
    }
    catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(403).json({ msg: "Invalid or expired token" });
    }


}

module.exports = {
    authMiddleware
}