//  fname: {string, mandatory},
//    lname: {string, mandatory},
//    email: {string, mandatory, valid email, unique},
//    phone: {string, not mandatory, unique, valid Indian mobile number}, 
//    password: {string, mandatory, minLen 8, maxLen 15}, // encrypted password
//    createdAt: {timestamp},
//    updatedAt: {timestamp}


const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
   fname: {
      type: String,
      required: true
   },
   lname: {
      type: String,
      required: true
   },
   email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true

   },
   phone: {
         type: String,
         unique: true,
         trim: true
     
   }, 
   password: {
      type: String,
      required: true,
      trim: true
   }, 
   
   creditScore: {
      type:Number,
      required:true
   }
 
},  { timestamps: true })

module.exports = mongoose.model('UserQuora', userSchema)


