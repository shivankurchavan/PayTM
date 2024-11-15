const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware");
const {Account} = require("../db");
const { default: mongoose } = require('mongoose');
const { v4: uuidv4 } = require('uuid');

router.get("/balance",authMiddleware ,async(req,res)=>{
    const account = await Account.findOne({
        userId: req.userId,
    })

    res.json({
        balance: account.balance,
    })
})


router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    const { amount, to } = req.body;

    // Fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.userId }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        });
    }

    // Perform the transfer
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    // Commit the transaction
    await session.commitTransaction();

    res.json({
        message: "Transfer successful"
    });
});


router.post("/request",authMiddleware,async(req,res)=>{
    const session = await mongoose.startSession();
    const {targetUserId,amount,requestId,action} = req.body;

    try{
        session.startTransaction();
        if ( action === "create"){
            const targetAccount = await Account.findOne({userId:targetUserId}).session(session);
            if (!targetAccount){
                await session.abortTransaction();
                return res.status(400).json({messgae:"Target Account not found."});
            }
            targetAccount.moneyRequests.push({
                requestId:uuidv4(),
                requestersId:req.userId,
                amount,
                status:"pending",
                createdAt:new Date(),
            })
            await targetAccount.save({session});
            await session.commitTransaction();
            return res.json({message:"request created successfully."});

        }else if (action === "approve"){
            const account = await Account.findOne({userId:req.userId}).session(session);
            if (!account){
                await session.abortTransaction();
                return res.status(400).json({messgae:"Target Account not found."});
            }
            const request = account.moneyRequests.find((req)=> req.requestId === requestId && req.status === "pending" );

            if (!request){
                await session.abortTransaction();
                return res.status(400).json({messgae:"request not found."}); 
            }

            if(account.balance < request.amount){
                await session.abortTransaction();
                return res.status(400).json({messgae:"balance is insufficient"}); 
            }

            const toAccount = await Account.findOne({userId:request.requestersId}).session(session);

            if (!toAccount) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Invalid requester account" });
            }

            account.balance -= request.amount;
            toAccount.balance += request.amount;

            request.status= "approved";

            await account.save({session});
            await toAccount.save({session});

            await session.commitTransaction();
            return res.json({message:"transaction completed"});



        }else if (action === "reject"){
            const account = await Account.findOne({userId:req.userId}).session(session);

            if (!account){
                await session.abortTransaction();
                return res.status(400).json({messgae:"Target Account not found."});
            }

            const requestIndex = account.moneyRequests.findIndex((req)=>req.requestId === requestId && req.status==="pending");

            if (requestIndex === -1){
                await session.abortTransaction();
                return res.status(400).json({message:"req not found or processed"});
            }

            account.moneyRequests.splice(requestIndex,1);

            await account.save({session});
            await session.commitTransaction();

            return res.json({message:"request rejected successfully."})

        }else {
            await session.abortTransaction();
            return res.status(400).json({message:"invalid action"});
        } 
    }catch (error){
        await session.abortTransaction();
        console.log(error);
        res.json({message:"an error occured", error});
    }finally {
        session.endSession();
    }
});

module.exports = router;