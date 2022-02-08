const questionModel = require('../models/questionModel')
const userModel = require('../models/userModel')
const answerModel = require('../models/answerModel')
const ObjectId = require('mongoose').Types.ObjectId;

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.length === 0) return false
    return true;
}

const createquestion = async (req, res) => {
    try {
        const { description, tag, askedBy} = req.body;
        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
        }
        if (!isValid(tag)) {
            return res.status(400).send({ status: false, message: "Please provide tag field" });
        }
        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "Please provide description field" });
        }
        let checkid = ObjectId.isValid(askedBy);
        if (!checkid) {
            return res.status(404).send({ status: false, message: "Please provide a valid userId " })
        }
        if (req.userId != askedBy) {
            return res.status(400).send({ status: false, message: "Sorry you are not authorized to do this action" })
        }
        const checkUser = await userModel.findOne({ _id: askedBy })
        if (!checkUser) {
            return res.status(404).send({ status: false, msg: 'you are not a valid user' })
        }

        if(checkUser.creditScore < 100){
            res.status(400).send({ status: false, message: `cannot post any question due to insufficient creditScore ${checkUser.creditScore}` })
            return
        }
        await userModel.findOneAndUpdate({ _id: askedBy },{creditScore:checkUser.creditScore - 100},{new:true})

        const data = await questionModel.create(req.body)
        return res.status(201).send({ status: true, message: "successfully", data })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const getQuestions = async (req, res) => {
    try {
        let filterQuery = { isDeleted: false }
        let querybody = req.query;

        let { tag, sort } = querybody;

        if (isValid(tag)) {
            filterQuery['tag'] = tag
        }

        if (isValid(sort)) {
            sort = sort.toLowerCase();
            if (sort == "ascending") {
                var data = await questionModel.find(filterQuery).lean().sort({ createdAt: 1 })
            }
            if (sort == "descending") {
                var data = await questionModel.find(filterQuery).lean().sort({ createdAt: -1 });
            }
        }

        if (!sort) {
            var data = await questionModel.find(filterQuery).lean();
        }

        for (let i = 0; i < data.length; i++) {
            let answer = await answerModel.find({ questionId: data[i]._id }).select({ text: 1, answeredBy: 1 })
            if (answer.length == 0) {
                continue;
            }
            data[i].answers = answer
        }

        if (data.length == 0) {
            return res.status(400).send({ status: false, message: "No Question found" })
        }

        return res.status(200).send({ status: true, Details: data });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getQuestionById = async (req, res) => {
    try {
        const questionId = req.params.questionId
        let checkid = ObjectId.isValid(questionId);
        if (!checkid) {
            return res.status(404).send({ status: false, message: "Please provide a valid questionId " })
        }
        let checkque = await questionModel.findOne({ _id: questionId, isDeleted: false })
        if (!checkque) {
            return res.status(404).send({ status: false, message: " questionId not found " })
        }
        const answers = await answerModel.find({ questionId: questionId , isDeleted:false}).sort({ "createdAt": -1 })
        checkque = checkque.toObject()
        checkque['answers'] = answers
        return res.status(200).send({ status: true, msg: 'successful details of answers ', data: checkque })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }


}

const updatequestion = async (req, res) => {
    try {
        const params = req.params.questionId;
        const { description, tag, askedBy } = req.body;
        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
        }
        if (tag) {
            if (!isValid(tag)) {
                return res.status(400).send({ status: false, message: "Please provide tag field" });
            }
        }
        if (description) {
            if (!isValid(description)) {
                return res.status(400).send({ status: false, message: "Please provide description field" });
            }
        }
        let checkid = ObjectId.isValid(askedBy);
        if (!checkid) {
            return res.status(400).send({ status: false, message: "Please provide a valid userId " })
        }
        let questionid = ObjectId.isValid(params);
        if (!questionid) {
            return res.status(400).send({ status: false, message: "Please provide a valid questionId " })
        }
        if (req.userId != askedBy) {
            return res.status(400).send({ status: false, message: "Sorry you are not authorized to do this action" })
        }
        const updateUser = await userModel.findOne({ _id: askedBy })
        if (!updateUser) {
            return res.status(400).send({ status: false, msg: 'you are not a valid user' })
        }

        const findquestion = await questionModel.findById({ _id: params, isDeleted: false })
        if (!findquestion) {
            return res.status(404).send({ status: false, message: `No question found ` })

        }

        const upatedquestion = await questionModel.findOneAndUpdate({ questionId: params }, { description: req.body.description, tag: req.body.tag }, { new: true })
        res.status(200).send({ status: true, message: 'question updated successfully', data: upatedquestion });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const deleteQuestion = async (req, res) => {
    try {

        const params = req.params.questionId;
        let checkid = ObjectId.isValid(params);
        //console.log(checkid)
        if (!checkid) {
            return res.status(400).send({ status: false, message: "Please provide a valid userId " })
        }
        const findquestion = await questionModel.findById({ _id: params, isDeleted: false })
        if (!findquestion) {
            return res.status(404).send({ status: false, message: `No question found ` })
        }
        const askedBy = findquestion.askedBy
    
        if (req.userId != askedBy) {
            return res.status(400).send({ status: false, message: "Sorry you are not authorized to do this action" })
        }
        const deleteData = await questionModel.findOneAndUpdate({ questionId: params }, { isDeleted: true }, { new: true });
        return res.status(200).send({ status: true, message: "question deleted successfullly.", data: deleteData })

    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}



module.exports = { createquestion, updatequestion, deleteQuestion, getQuestionById, getQuestions }