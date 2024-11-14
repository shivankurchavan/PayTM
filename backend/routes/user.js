const express = require("express");

const router = express.Router();

const jwt = require("jsonwebtoken")
const {JWT_SECRET} = require("../config")
const zod = require("zod");
const {User, Account} = require("../db")
const {authMiddleware} = require("../middleware")


const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

router.post("/signup",async (req,res)=>{
    console.log("req reached signup route")
    const body = req.body;
    const {success} = signupSchema.safeParse(body);
    if (!success){
        return res.status(411).json({
            message: "invalid inputs"
        })
    }
    const user = await User.findOne({
        username: body.username
    })

    if (user){
        return res.status(411).json({
            message: "already present" 
        })
    }

    const dbUser = await User.create(body);

    const userId = dbUser._id;

    await Account.create({
        userId,
        balance: 1+ Math.random() * 10000,
    })

    const token = jwt.sign({
        userId: dbUser._id
    }, JWT_SECRET)
    res.status(200).json({
        message: "user created succefully",
        token:token,
    })
})

const signInBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
})

router.post("/signin",async(req, res)=>{
    const body = req.body;

    const {success} = signInBody.safeParse(body);

    if (!success){
        return res.status(411).json({
            message: "incorrect inputs"
        })
    }
    const user = await User.findOne({
        username: body.username,
        password: body.password
    })
    
    if (user){
        const token = jwt.sign({
            userId: user._id
        },JWT_SECRET);
        res.json({
            message:"logged in successfully",
            token: token
        })

        return;    
    }

    return res.status(411).json({
        message:"error while logginf in"
    })
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/", authMiddleware, async (req, res) => {
    const parsedResult = updateBody.safeParse(req.body);

    if (!parsedResult.success) {
        return res.status(400).json({
            message: "Error while updating information",
            errors: parsedResult.error.errors, // You can add the error details for debugging
        });
    }

    try {
        const updateData = {};

        // Only include fields that were provided in the request
        if (req.body.password) updateData.password = req.body.password;
        if (req.body.firstName) updateData.firstName = req.body.firstName;
        if (req.body.lastName) updateData.lastName = req.body.lastName;

        const result = await User.updateOne(
            { _id: req.userId },  // Filter by the userId (or _id)
            { $set: updateData }  // Update only the fields that were provided
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                message: "No changes were made",
            });
        }

        res.json({
            message: "Updated successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error while updating user data",
        });
    }
});


router.get("/bulk", async(req,res)=>{
    const filter = req.query.filter || "";
    const users = await User.find({
        $or:[{
            firstName:{
                "$regex":filter,
            }
        },{
            lastName:{
                "$regex":filter,
            }
        }]
    })

    res.json({
        user:users.map(user=>({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id,
        }))
    })
})


module.exports = router;