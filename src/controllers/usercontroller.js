const userModel = require('../models/userModel')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ObjectId = require('mongoose').Types.ObjectId;
const validator = require("email-validator")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}

const isValidMobileNum = function (value) {
    if (!(/^[6-9]\d{9}$/.test(value))) {
        return false
    }
    return true
}

const isValidSyntaxOfEmail = function (value) {
    if (!(validator.validate(value))) {
        return false
    }
    return true
}


const createUser = async function (req, res) {
    try {
        let userBody = req.body
        console.log(userBody)
        if (!isValidRequestBody(userBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
        }
        let { fname, lname, email, phone, password, creditScore } = userBody;
        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "Please provide fname or fname field" });
        }
        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "Please provide lname or lname field" });
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide Email id or email field" });;
        }
        if (!isValidSyntaxOfEmail(email)) {
            return res.status(404).send({ status: false, message: "Please provide a valid Email Id" });
        }
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "Please provide phone number or phone field" });
        }
        if (!isValidMobileNum(phone)) {
            return res.status(400).send({ status: false, message: '1 Please provide a valid phone number' })
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide password or password field" });;
        }
        let size = Object.keys(password.trim()).length
        if (size < 8 || size > 15) {
            return res.status(400).send({ status: false, message: "Please provide password with minimum 8 and maximum 14 characters" });;
        }
        if (!isValid(creditScore)) {
            return res.status(400).send({ status: false, message: "Please provide creditScore field" });
        }
        const isphoneAlreadyUsed = await userModel.findOne({ phone });

        if (isphoneAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${phone} phone is already registered` })
        }

        const isEmailAlreadyUsed = await userModel.findOne({ email });

        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${email} email address is already registered` })
        }
        //------------------------------------validation ends -----------------------------------------------------
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt)
        const userdata = { fname, lname, email, phone, password, creditScore }
        const createddata = await userModel.create(userdata)
        return res.status(201).send({ status: true, message: 'success', data: createddata })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



const userLogin = async (req, res) => {
    try {
        const myEmail = req.body.email
        const myPassword = req.body.password

        let user = await userModel.findOne({ email: myEmail });
        if (user) {
            const { _id, fname, lname, password } = user
            const validPassword = await bcrypt.compare(myPassword, password);
            if (!validPassword) {
                return res.status(400).send({ message: "Invalid Password" })
            }
            let payload = { userId: _id, email: myEmail };
            const generatedToken = jwt.sign(payload, "Quora");

            res.header('authorization', generatedToken);
            return res.status(200).send({
                Message: fname + " " + lname + " you have logged in Succesfully",
                userId: user._id,
                token: generatedToken,
            });
        } else {
            return res.status(400).send({ status: false, message: "Invalid credentials" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};


const getuserById = async (req, res) => {
    try {
        const userId = req.params.userId
        let checkId = ObjectId.isValid(userId);
        if (!checkId) {
            return res.status(400).send({ status: false, message: "Please Provide a valid userId in query params" });;
        }
        if (!(req.userId == userId)) {
            return res.status(400).send({ status: false, message: "Sorry you are not authorized to do this action" })
        }

        const searchprofile = await userModel.findOne({ _id: userId })
        if (!searchprofile) {
            return res.status(404).send({ status: false, message: 'profile does not exist' })
        }
        res.status(200).send({ status: true, message: 'user profile details', data: searchprofile })
    } catch (error) {
        return res.status(500).send({ success: false, error: error.message });
    }
}


const updateProfile = async (req, res) => {
    try {
        const userId = req.params.userId
        let userBody = req.body
        if (!isValidRequestBody(userBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
        }
        let { fname, lname, email, phone} = userBody;
        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "Please provide fname or fname field" });
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "Please provide lname or lname field" });
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide Email id or email field" });;
        }
        if (!isValidSyntaxOfEmail(email)) {
            return res.status(404).send({ status: false, message: "Please provide a valid Email Id" });
        }
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "Please provide phone number or phone field" });
        }
        if (!isValidMobileNum(phone)) {
            return res.status(400).send({ status: false, message: '1 Please provide a valid phone number' })
        }
        const isphoneAlreadyUsed = await userModel.findOne({ phone });

        if (isphoneAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${phone} phone is already registered` })
        }

        const isEmailAlreadyUsed = await userModel.findOne({ email });

        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${email} email address is already registered` })
        }
        let checkId = ObjectId.isValid(userId);
        if (!checkId) {
            return res.status(400).send({ status: false, message: "Please Provide a valid userId in query params" });;
        }
        if (!(req.userId == userId)) {
            return res.status(400).send({ status: false, message: "Sorry you are not authorized to do this action" })
        }

        let updateProfile = await userModel.findOneAndUpdate({ _id: userId }, { fname: fname, lname: lname, email: email, phone: phone }, { new: true })
        res.status(200).send({ status: true, message: "user profile updated successfully", data: updateProfile })
        
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports = { createUser, userLogin, getuserById, updateProfile }









