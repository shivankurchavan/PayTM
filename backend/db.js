const mongoose = require('mongoose');
require('dotenv').config(); // to load environment variables from .env file

const MONGO_URL = process.env.MONGO_URL;  // Access environment variable

// Ensure you check that MONGO_URL exists in your .env file
if (!MONGO_URL) {
  console.error("MONGO_URL is not defined in .env");
  process.exit(1);  // Exit if the Mongo URL is not set
}

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);  // Exit on connection failure
  });



const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String
})


const accountSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    balance:{
        type:Number,
        required:true,
    }
})

const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);
module.exports = {
    User,
    Account
}