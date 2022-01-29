const express = require('express');
const router = express.Router();

const userController =require("../controllers/usercontroller")
const myMiddleware = require('../middleware/middleware');
const questionController = require('../controllers/questionController')
const answerController = require('../controllers/answerController')





//------------------------User routes-----------------------
router.post('/register', userController.createUser)
router.post('/login', userController.userLogin)
router.get('/user/:userId/profile', myMiddleware.checkLogin, userController.getuserById) 
router.put('/user/:userId/profile', myMiddleware.checkLogin, userController.updateProfile)

// //-----------------------question API-------------------------------
 router.post('/question', myMiddleware.checkLogin, questionController.createquestion)
router.get('/questions',questionController.getQuestions)
router.get('/questions/:questionId',questionController.getQuestionById )
router.put('/questions/:questionId',myMiddleware.checkLogin,questionController. updatequestion)
router.delete('/questions/:questionId',myMiddleware.checkLogin, questionController.deleteQuestion)

// //---------------------------answer API-----------------------------------------
router.post('/answer',myMiddleware.checkLogin,answerController.createAnswer)
router.get('/questions/:questionId/answer',answerController.getdetails)
router.put('/answer/:answerId',myMiddleware.checkLogin,answerController.updateanswer)
router.delete('/answer/:answerId',myMiddleware.checkLogin,answerController.deleteanswer)






module.exports = router;